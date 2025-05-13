// File: useLive2dModel.js
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel, MotionPreloadStrategy, MotionPriority } from 'pixi-live2d-display/cubism2'
import { getConfig, setModelId, setModelTexturesId, updateMessageArray, getMessageArray } from '../utils/config.js'
import showMessage from '../utils/message.js'
import modelList from '../utils/modelList.js'
import tips from '../utils/tips.js'

export function useLive2dModel(modelContainer, updateImgSize) {
  const VIEW = 290
  const DPR = window.devicePixelRatio || 1
  let app = null
  let live2dInst = null
  let autoTimer = null

  const roleIdx = ref(0)
  const skinIdx = ref(0)
  const isDragging = ref(false)
  const cdnPath = getConfig().cdnPath || '/'

  // 保存当前模型的动作和表情名字
  let motionNames = []
  let expressionNames = []

  // 封装“说话”逻辑
  function speak() {
    updateMessageArray(tips)
    showMessage(
      {
        model: live2dInst,
        app,
        tips,
        modelMotions: motionNames,
        modelExpressions: expressionNames
      },
      getMessageArray(),
      4000,
      10
    )
  }

  async function loadModel(modelId, textureId) {
    if (modelId >= modelList.length) modelId %= modelList.length
    if (textureId >= modelList[modelId].length) textureId %= modelList[modelId].length
    setModelId(modelId)
    setModelTexturesId(textureId)

    // 卸载旧实例
    if (live2dInst) {
      app.stage.removeChild(live2dInst)
      live2dInst.destroy()
      live2dInst = null
    }
    clearInterval(autoTimer)

    // 读取 index.json 并补齐 idle 动作/表情
    const rel = modelList[modelId][textureId]
    const idxUrl = `${cdnPath}model/${rel}/index.json`
    const indexJson = await fetch(idxUrl).then(r => r.json())
    indexJson.url = idxUrl
    if (!indexJson.motions.idle && indexJson.motions.idle01) indexJson.motions.idle = indexJson.motions.idle01
    if (!indexJson.expressions.find(e => e.name === 'idle')) {
      const i01 = indexJson.expressions.find(e => e.name === 'idle01')
      if (i01) indexJson.expressions.push({ name: 'idle', file: i01.file })
    }

    // 保存动作和表情名字
    motionNames = Object.keys(indexJson.motions)
    expressionNames = indexJson.expressions.map(e => e.name)

    // 初始化 Pixi 应用
    if (!app) {
      Live2DModel.registerTicker(PIXI.Ticker)
      app = new PIXI.Application({
        width: VIEW,
        height: VIEW,
        resolution: DPR,
        autoDensity: true,
        backgroundAlpha: 0,
        antialias: true
      })
      app.view.style.pointerEvents = ''
      modelContainer.value.appendChild(app.view)
    } else {
      app.stage.removeChildren()
    }

    // 创建并添加 Live2D 模型
    live2dInst = await Live2DModel.from(indexJson, { motionPreload: MotionPreloadStrategy.ALL })
    live2dInst.anchor.set(0.5, 0.9)
    live2dInst.scale.set(0.17)
    live2dInst.position.set(app.view.width / 2, app.view.height)
    live2dInst.interactive = true
    app.stage.addChild(live2dInst)

    // 动作播放逻辑
    const motions = indexJson.motions
    const groups = Object.keys(motions).filter(g => !/idle/i.test(g))
    const fallback = ['idle']
    const playRandom = (force = false) => {
      if (!force && isDragging.value) return
      if (!force && !live2dInst.animator.isFinished) return
      const list = groups.length ? groups : fallback
      const g = list[Math.floor(Math.random() * list.length)]
      const arr = motions[g] || []
      if (!arr.length) return
      const ix = Math.floor(Math.random() * arr.length)
      live2dInst.motion(g, ix, force ? MotionPriority.FORCE : MotionPriority.NORMAL)
        .then(() => {
          const exp = indexJson.expressions.find(e => e.name === g)
          if (exp) live2dInst.expression(exp.name)
        })
        .catch(() => {})
    }

    const start = () => {
      updateImgSize()
      playRandom()
      autoTimer = setInterval(() => playRandom(false), 10000)
    }
    if (live2dInst.internalModel.ready) start()
    else live2dInst.once('ready', start)

    // 点击模型时：播放动作 + 说话
    live2dInst.on('pointertap', () => {
      playRandom(true)
      speak()
    })

    // 首次加载时自动说一句话
    speak()
  }

  onMounted(() => loadModel(0, 0))
  onBeforeUnmount(() => {
    clearInterval(autoTimer)
    live2dInst?.destroy()
    app?.destroy(true, { children: true })
  })

  async function nextModel() {
    roleIdx.value = (roleIdx.value + 1) % modelList.length
    skinIdx.value = 0
    await loadModel(roleIdx.value, 0)
  }
  async function nextTexture() {
    skinIdx.value = (skinIdx.value + 1) % modelList[roleIdx.value].length
    await loadModel(roleIdx.value, skinIdx.value)
  }

  return { roleIdx, skinIdx, isDragging, nextModel, nextTexture, speak }
}










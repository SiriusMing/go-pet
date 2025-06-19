// File: useLive2dModel.js
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'
import {
  Live2DModel,
  MotionPreloadStrategy,
  MotionPriority
} from 'pixi-live2d-display/cubism2'
import {
  setModelId,
  setModelTexturesId,
  updateMessageArray,
  getMessageArray
} from '../utils/config.js'
import showMessage from '../utils/message.js'
import modelList   from '../utils/modelList.js'
import tips        from '../utils/tips.js'

export function useLive2dModel(modelContainer, updateImgSize) {
  const VIEW = 290
  const DPR  = window.devicePixelRatio || 1

  let app            = null      // PIXI.Application
  let live2dInst     = null      // 当前 Live2D 实例
  let idleTimer      = null      // 默认 idle 循环定时器
  let chatTimer      = null      // Chat 模式专用定时器
  let chatActive     = false

  // 外部调用 startChatAuto 时触发此函数（后面在 loadModel 中被覆盖）
  let triggerRandomMotion = () => {}

  const roleIdx    = ref(0)
  const skinIdx    = ref(0)
  const isDragging = ref(false)

  let motionNames     = []
  let expressionNames = []

  /**
   * speak：显示气泡文字
   */
  function speak(custom = null) {
    // 1) 如果 custom 是 tips 上的 key
    if (typeof custom === 'string' && Array.isArray(tips[custom])) {
      showMessage(
        { model: live2dInst, app, tips: null, modelMotions: motionNames, modelExpressions: expressionNames },
        tips[custom].flat(),
        4000, 10
      )
      return
    }
    // 2) 如果 custom 本身是 array-of-arrays
    if (Array.isArray(custom) && Array.isArray(custom[0])) {
      showMessage(
        { model: live2dInst, app, tips: null, modelMotions: motionNames, modelExpressions: expressionNames },
        custom.flat(),
        4000, 10
      )
      return
    }
    // 3) 如果 custom 是 selector，深度搜索 tips
    if (typeof custom === 'string') {
      let found = null
      const dfs = obj => {
        if (!obj || typeof obj !== 'object') return
        if (Array.isArray(obj)) {
          obj.forEach(dfs)
        } else {
          if (obj.selector === custom && Array.isArray(obj.text)) {
            found = obj.text
          }
          Object.values(obj).forEach(dfs)
        }
      }
      dfs(tips)
      if (found) {
        showMessage(
          { model: live2dInst, app, tips: null, modelMotions: motionNames, modelExpressions: expressionNames },
          found.flat(),
          4000, 10
        )
        return
      }
    }
    // 4) 默认随机
    updateMessageArray(tips)
    showMessage(
      { model: live2dInst, app, tips, modelMotions: motionNames, modelExpressions: expressionNames },
      getMessageArray(),
      4000, 10
    )
  }

  /**
   * Chat 模式：每 5s 切一个动作（不说话）
   */
  function startChatAuto() {
  console.log('[useLive2dModel] startChatAuto()')
  stopChatAuto()
  chatActive = true
  console.log('[useLive2dModel] chatActive =', chatActive)
  chatTimer = setInterval(() => {
    console.log('[useLive2dModel] 🕒 chatTimer tick, chatActive=', chatActive)
    // 强制无条件触发，绕开 isFinished/isDragging
    triggerRandomMotion(true)
  }, 5000)
}

  function stopChatAuto() {
    chatActive = false
    if (chatTimer) {
      clearInterval(chatTimer)
      chatTimer = null
    }
  }

  /**
   * 加载模型主流程
   */
  async function loadModel(row, tex) {
    // 越界保护 + 记录
    if (row >= modelList.length)   row %= modelList.length
    if (tex >= modelList[row].length) tex %= modelList[row].length
    roleIdx.value = row
    skinIdx.value = tex
    setModelId(row)
    setModelTexturesId(tex)

    // 卸载旧实例 & 清掉定时
    if (live2dInst) {
      app.stage.removeChild(live2dInst)
      live2dInst.destroy()
    }
    clearInterval(idleTimer)
    stopChatAuto()

    // 拉取 index.json
    const rel    = modelList[row][tex]
    const idxUrl = `${import.meta.env.BASE_URL}model/${rel}/index.json`
    const indexJson = await fetch(idxUrl).then(r => r.json())
    indexJson.url = idxUrl

    // idle 补丁
    if (!indexJson.motions.idle && indexJson.motions.idle01) {
      indexJson.motions.idle = indexJson.motions.idle01
    }
    if (!indexJson.expressions.some(e => e.name === 'idle')) {
      const i01 = indexJson.expressions.find(e => e.name === 'idle01')
      if (i01) indexJson.expressions.push({ name: 'idle', file: i01.file })
    }

    // 保存动作/表情名字
    motionNames     = Object.keys(indexJson.motions)
    expressionNames = indexJson.expressions.map(e => e.name)

    // PIXI 应用初始化
    if (!app) {
      Live2DModel.registerTicker(PIXI.Ticker)
      app = new PIXI.Application({
        width:        VIEW,
        height:       VIEW,
        resolution:   DPR,
        autoDensity:  true,
        backgroundAlpha: 0,
        antialias:    true
      })
      app.view.style.pointerEvents = 'auto'
      modelContainer.value.appendChild(app.view)
    } else {
      app.stage.removeChildren()
    }

    // 创建 Live2D 实例
    live2dInst = await Live2DModel.from(indexJson, {
      motionPreload: MotionPreloadStrategy.ALL
    })
    live2dInst.anchor.set(0.5, 0.9)
    live2dInst.scale.set(0.17)
    live2dInst.position.set(app.view.width / 2, app.view.height)
    live2dInst.interactive = true
    app.stage.addChild(live2dInst)

    // 构造随机动作函数，并覆盖外层 triggerRandomMotion
    const motions  = indexJson.motions
    const groups   = Object.keys(motions).filter(g => !/idle/i.test(g))
    const fallback = ['idle']
    triggerRandomMotion = (force = false) => {
      if (!force && isDragging.value)                return
      if (!force && !live2dInst.animator.isFinished) return
      const list = groups.length ? groups : fallback
      const g    = list[Math.floor(Math.random() * list.length)]
      const arr  = motions[g] || []
      if (!arr.length) return
      const ix = Math.floor(Math.random() * arr.length)
      live2dInst.motion(g, ix, force ? MotionPriority.FORCE : MotionPriority.NORMAL)
        .then(() => {
          const exp = indexJson.expressions.find(e => e.name === g)
          if (exp) live2dInst.expression(exp.name)
        })
        .catch(() => {})
    }

    // 启动默认 idle 循环
    const startIdleLoop = () => {
      updateImgSize()
      triggerRandomMotion()
      idleTimer = setInterval(() => triggerRandomMotion(false), 10000)
      setInterval(() => triggerRandomMotion(true), 5000)
    }
    if (live2dInst.internalModel.ready) {
      startIdleLoop()
    } else {
      live2dInst.once('ready', startIdleLoop)
    }

    // 点击模型：停止 Chat 循环 + 单次动作 + 说话
    live2dInst.on('pointertap', () => {
      stopChatAuto()
      triggerRandomMotion(true)
      speak()
    })

    // 首次加载问候
    if (row === 0 && tex === 0) {
      speak('#waifu-tool-begin')
    } else {
      speak()
    }
  }

  // 生命周期挂载
  onMounted(() => loadModel(0, 0))
  onBeforeUnmount(() => {
    stopChatAuto()
    clearInterval(idleTimer)
    live2dInst?.destroy()
    app?.destroy(true, { children: true })
  })

  // 角色 / 贴图 切换
  async function nextModel() {
    const persons = ['Takamatsu_Tomori','Anon_Chihaya','Rana_Kaname','Soyo_Nagasaki','Taki_Shiina']
    roleIdx.value = (roleIdx.value + 1) % persons.length
    skinIdx.value = 0
    await loadModel(roleIdx.value, skinIdx.value)
    await window.electronAPI?.writeCharacter?.(persons[roleIdx.value])
    speak('#waifu-tool-switch-model')
  }
  async function nextTexture() {
    skinIdx.value = (skinIdx.value + 1) % modelList[roleIdx.value].length
    await loadModel(roleIdx.value, skinIdx.value)
    speak('#waifu-tool-switch-texture')
  }

  return {
    roleIdx,
    skinIdx,
    isDragging,
    nextModel,
    nextTexture,
    speak,
    startChatAuto,
    stopChatAuto
  }
}















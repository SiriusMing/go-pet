<!-- pet.vue -->
<template>
  <div
    class="pet-wrapper"
   :style="{
     left:  x + 'px',
     top:   y + 'px'
   }"
    @mouseenter="showControls"
    @mouseleave="scheduleHide"
    @mousedown.prevent="startDrag"
  >
    <!-- Pet Image -->
    <!--
    <img
      ref="imgEl"
      class="pet-img"
      :src="petSrc"
      alt="pet"
      @load="updateImgSize"
      @mousedown.prevent="startDrag"
      :style="{
        width:  imgW  + 'px',
        height: imgH  + 'px',
        cursor: isDragging ? 'grabbing' : 'grab'
      }"-->
    <!-- —— Live2D 模型容器 —— -->
    <div
      ref="modelContainer"
      class="pet-model"
      :src="petSrc"
      alt="pet"
      @load="updateImgSize"
      @mousedown.prevent="startDrag"
    ></div>
    <!-- 左侧按钮 -->
    <transition name="fade">
      <div
        v-if="ctrlVisible && !nearLeft"
        class="ctrl-col left"
        :style="leftStyle"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <button class="btn icon info-btn"     @click="onClick('Info')">👤</button>
        <button class="btn icon settings-btn" @click="onClick('Settings')">⚙</button>
        <button class="btn circle switch-btn" @click="onClick('Switch')">S</button>
        <button class="btn circle exit-btn"   @click="exitApp">E</button>
      </div>
    </transition>

    <!-- 右侧按钮 -->
    <transition name="fade">
      <div
        v-if="ctrlVisible && !nearRight"
        class="ctrl-col right"
        :style="rightStyle"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <button class="btn circle dress-btn" @click="onClick('Dress')">D</button>
        <button class="btn rect chat-btn"    @click="onClick('Chat')">Chat</button>
        <button
          v-if="!panelVisible"
          class="btn rect other-btn"
          @click.stop="togglePanel"
        >Other</button>
      </div>
    </transition>

    <!-- 功能面板 -->
    <transition name="fade">
      <div
        v-if="panelVisible"
        ref="panelEl"
        class="panel"
        :style="panelPos"
        @mouseenter="showControls"
        @mouseleave="scheduleHide"
      >
        <div
          v-for="f in features"
          :key="f"
          class="panel-item"
          @click="onClick(f)"
        >{{ f }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount} from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'
import usePetLogic from './petLogic.js'

const {
  x, y,
  ctrlVisible, nearLeft, leftStyle, rightStyle,
  showControls, scheduleHide, startDrag,
  togglePanel, exitApp,
  panelVisible, panelPos, panelEl, features,          
  updateImgSize
} = usePetLogic()

const modelContainer = ref(null)
let app = null

onMounted(async () => {
  try {
    /* ──1. 分辨率策略──
     - 逻辑尺寸 (在页面上看到的大小) 180×250
     - 高 DPI 清晰度：只改 resolution / autoDensity，
       不再把 width/height 乘 DPR，也不再用 style 压回 */
  const VIEW_W = 265
  const VIEW_H = 265
  const DPR     = window.devicePixelRatio || 1     

  Live2DModel.registerTicker(PIXI.Ticker)

  app = new PIXI.Application({
    width          : VIEW_W,        // 逻辑尺寸保持不变
    height         : VIEW_H,
    resolution     : DPR,           // 真正决定像素密度
    autoDensity    : true,          // 告诉 Pixi 用高分辨率渲染
    backgroundAlpha: 0,
    autoStart      : true,
    antialias      : true           // 视情况可关
  })

  /* ──2. 让 canvas 默认不吃鼠标事件──
     - React/Vue 里拖拽时再临时打开即可
     - 如果你的拖拽逻辑用到 safeIgnore(false)，
       这里保持 'none' 也没问题，因为事件走 Electron 的 forward 通道 */
  app.view.style.pointerEvents = 'none'

  modelContainer.value.appendChild(app.view)

  /* ──3. 加载并摆放 Live2D 模型── */
  const model = await Live2DModel.from('/model/rana/038_live_event_235_sr/index.json')
  model.anchor.set(0.5, 0.9)                            // 脚踩底边
  model.position.set(app.view.width / 2, app.view.height)
  model.scale.set(0.17)                                 // 比原来稍大

  app.stage.addChild(model)
  // 模型 ready 后再更新一次容器尺寸
  model.once('ready', () => {
    updateImgSize()
 })
  

    model.once('ready', () => {
      console.log('[DEBUG] Live2D model loaded successfully.')
    })

  } catch (err) {
    console.error('[ERROR] Live2D initialization failed:', err)
  }
})

onBeforeUnmount(() => {
  app?.destroy(true, { children: true })
  console.log('[DEBUG] Pixi Application destroyed')
})

const emit = defineEmits(['open'])
function onClick(feature) { emit('open', feature) }
</script>


<style scoped src="./petStyle.css">
.pet-model {
  position: relative;      /* 或干脆删掉 */
  display: inline-block;   /* 让它“缩紧”到 canvas 本身 */
  overflow: visible;
}

</style>

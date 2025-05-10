<!-- pet.vue -->
<template>
  <div
    class="pet-wrapper"
    :style="{ left: x + 'px', top: y + 'px' }"
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'
import usePetLogic from './petLogic.js'

const {
  x, y,
  ctrlVisible, nearLeft, leftStyle, rightStyle,
  showControls, scheduleHide, startDrag,
  togglePanel, exitApp,
  panelVisible, panelPos, panelEl, features,
} = usePetLogic()

const modelContainer = ref(null)
let app = null

onMounted(async () => {
  try {
    // 确保只使用一个Pixi实例，注册Ticker类
    Live2DModel.registerTicker(PIXI.Ticker)

    // 创建Pixi应用
    app = new PIXI.Application({
      width: 120,
      height: 120,
      backgroundAlpha: 0,
      autoStart: true,
    })

    // 添加canvas到DOM
    modelContainer.value.appendChild(app.view)

    // 加载Live2D模型（自动更新，不需要设置autoUpdate: false）
    const model = await Live2DModel.from('/model/tomori/036_birthday_2024_ssr/index.json')

    model.anchor.set(0.5, 1)
    model.position.set(app.view.width / 2, app.view.height * 0.9)
    model.scale.set(0.2)

    app.stage.addChild(model)

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
  position: absolute; 
  width: 120px;
  height: 120px;
}
</style>

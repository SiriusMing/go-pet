<template>
  <!-- 整个面板：fixed+left/top 由 posX/posY 控制 -->
  <div
    ref="wrapperRef"
    class="char-selection"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="startDrag"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <!-- 顶部标题栏 -->
    <div class="top-bar">
      <button
        class="return-btn pixel-frame"
        @mousedown.stop
        @click.stop="goBack"
      >
        Return
      </button>
    </div>

    <!-- 五个矩形面板 -->
    <div class="panels">
      <div
        v-for="(c, i) in characters"
        :key="i"
        class="panel pixel-frame"
        :style="{ backgroundColor: c.color, backgroundImage: 'url(' + c.image + ')', opacity: c.opacity }"
        @click="select(c)"
      >
        <div class="label pixel-box">{{ c.name }}</div>
      </div>
    </div>

    <!-- 角色详情面板（点击角色后显示）-->
    <!-- 角色详情面板 -->
<div v-if="selectedCharacter" class="character-detail">
  <!-- 角色头像 -->
  <div class="avatar">
    <!-- 可以放置角色头像的图片 -->
    <img :src="selectedCharacter.avatarImage" alt="角色情况" style="width:100%; height:100%; object-fit: cover;">

  </div>

  <!-- 角色名称 -->
  <h3>{{ selectedCharacter.name }} 的信息</h3>

  <!-- 角色属性 -->
  <p>性格: {{ selectedCharacter.personality }}</p>
  <p>角色: {{ selectedCharacter.color }}</p>

  <!-- 皮肤解锁信息 -->
  <div class="unlock-info">
    皮肤解锁数量: {{ selectedCharacter.skinUnlocked }} / {{ selectedCharacter.totalSkins }}
  </div>

  <!-- 关闭按钮 -->
  <button @click="closeDetail">关闭</button>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 抛出事件
const emit = defineEmits(['openpanel', 'select'])

// 拖拽状态
const wrapperRef = ref(null)
const posX = ref(100)
const posY = ref(100)
const panelW = ref(0)
const panelH = ref(0)
let dragging = false
let offX = 0, offY = 0

// 1. 先在顶部 import 静态图
import img1 from './pic/1.png'
import img2 from './pic/2.png'
import img3 from './pic/3.png'
import img4 from './pic/4.png'
import img5 from './pic/5.png'

const characters = ref([
  { name: 'Rana', color: '#EFFEEA', image: img1, opacity: 0.8, skinUnlocked: 5, totalSkins: 10, avatarImage: img1 },
  { name: 'Anon', color: '#FFE9F2', image: img2, opacity: 0.9, skinUnlocked: 3, totalSkins: 7, avatarImage: img2 },
  { name: 'Tomori', color: '#ECECE7', image: img3, opacity: 1.0, skinUnlocked: 7, totalSkins: 10, avatarImage: img3 },
  { name: 'Soyo', color: '#FFF7DC', image: img4, opacity: 0.7, skinUnlocked: 2, totalSkins: 5, avatarImage: img4 },
  { name: 'Taki', color: '#ECE5FF', image: img5, opacity: 0.85, skinUnlocked: 4, totalSkins: 8, avatarImage: img5 },
])

const selectedCharacter = ref(null)


// Electron 鼠标穿透 & 初始测量面板尺寸
const electronAPI = window?.electronAPI ?? null
onMounted(() => {
  // 在 DOM 渲染完成后测量一次面板尺寸
  panelW.value = wrapperRef.value.offsetWidth
  panelH.value = wrapperRef.value.offsetHeight
  electronAPI?.setIgnoreMouseEvents(false)
})
onBeforeUnmount(() => {
  electronAPI?.setIgnoreMouseEvents(true)
})

// 开始拖拽：记录鼠标相对于面板的偏移
function startDrag(e) {
  if (e.button !== 0) return    // 只响应左键
  dragging = true
  offX = e.clientX - posX.value
  offY = e.clientY - posY.value
  document.body.style.cursor = 'move'
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
}

// 拖拽中：根据鼠标位置减去偏移，并 clamp 到窗口内
function onDrag(e) {
  if (!dragging) return
  const w = panelW.value
  const h = panelH.value

  // 取视口尺寸（优先 visualViewport）
  const vw = window.visualViewport?.width ?? window.innerWidth
  const vh = window.visualViewport?.height ?? window.innerHeight

  // 计算新位置并确保面板不会超出屏幕
  const newPosX = e.clientX - offX
  const newPosY = e.clientY - offY

  // 限制 posX 和 posY 的值，确保面板不会超出屏幕边界
  posX.value = Math.max(-190, Math.min(newPosX, vw - w)-200)
  posY.value = Math.max(-38, Math.min(newPosY, vh - h)-50)
}

// 结束拖拽
function endDrag() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
  document.body.style.cursor = ''
}

// 点击“返回” → 切回 Goal（Fun3）面板
function goBack() {
  emit('openpanel', 'Fun3')
}

// 点击角色 → 发 select 事件
function select(character) {
  selectedCharacter.value = character
}

// 关闭角色详情面板
function closeDetail() {
  selectedCharacter.value = null // 清空 selectedCharacter 来关闭面板
}

// 鼠标穿透（Electron 环境下可用）
function disableClick() { electronAPI?.setIgnoreMouseEvents(false) }
function enableClick()  { electronAPI?.setIgnoreMouseEvents(true) }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.char-selection {
  position: fixed;
  width: 500px;
  height: 320px;
  background-color: #d8c4b2;
  border: 2px solid #000;
  border-radius: 10px 10px 16px 16px;
  box-shadow: 3px 3px 0 #000;
  font-family: 'Press Start 2P', monospace;
  cursor: move;
  user-select: none;
}

/* 返回按钮固定在面板右上角 */
.return-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #f4edd9;
  border: 3px solid #000;
  box-shadow: 2px 2px 0 #000, -1px -1px 0 #000 inset;
  padding: 4px 8px;
  font-size: 8px;
  cursor: pointer;
  pointer-events: auto;
  z-index: 10;
}

/* 面板列表 */
.panels {
  display: flex;
  height: calc(100% - 40px);
  margin-top: 33px;
}

/* 单个角色矩形面板 */
.panel {
  flex: 1;
  margin: 0 3px;
  position: relative;
  background-size: cover;
  background-position: center;
  border: 2px solid #000;
  box-shadow: 2px 2px 0 #000 inset;
  transition: transform 0.2s, box-shadow 0.2s;
}
.panel:hover {
  transform: scale(1.03);
  box-shadow: 2px 2px 0 #000;
  cursor: pointer;
}

/* 标签置于矩形下五分之一处 */
.label {
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #d7d6d1;
  border: 1px solid #000;
  box-shadow: 2px 2px 0 #000, -1px -1px 0 #000 inset;
  padding: 4px 14px;
  font-size: 8px;
  pointer-events: none;
}

/* 角色详情面板 */
.character-detail {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 350px;
  background-color: #F8D6D1; /* 粉色背景 */
  border: 3px solid #000; /* 粗黑色边框 */
  border-radius: 8px;
  padding: 20px;
  font-family: 'Press Start 2P', monospace; /* Pixel风格字体 */
  box-shadow: 4px 4px 0 #000; /* 阴影效果 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

/* 头像 */
.character-detail .avatar {
  width: 80px;
  height: 80px;
  border: 3px solid #000;
  background-color: #fff;
  margin-bottom: 20px;
  border-radius: 4px; /* 方形头像 */
}

/* 角色名称和属性 */
.character-detail h3 {
  font-size: 16px;
  font-weight: bold;
  color: #2d3e50;
  margin: 10px 0;
  text-align: center;
}

/* 角色信息文本 */
.character-detail p {
  font-size: 14px;
  line-height: 1.5;
  color: #444;
  margin: 5px 0;
  text-align: center;
}

/* 皮肤解锁数量 */
.character-detail .unlock-info {
  background-color: #FFCCBC; /* 淡粉色背景 */
  padding: 10px 20px;
  border: 2px solid #000;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 14px;
  color: #2d3e50;
  text-align: center;
}

/* 关闭按钮 */
.character-detail button {
  background: #FF4C4C; /* 红色背景 */
  color: white;
  font-size: 14px;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
  box-shadow: 2px 2px 0 #000; /* 给按钮加阴影 */
  margin-top: 10px;
}

.character-detail button:hover {
  background: #e04c4c; /* 鼠标悬停时改变背景色 */
  transform: scale(1.05); /* 鼠标悬停时放大按钮 */
}

.character-detail button:focus {
  outline: none;
}


</style>



  




  
  
  
  
  
  

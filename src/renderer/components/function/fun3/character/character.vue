<template>
  <div
    ref="wrapperRef"
    class="char-selection"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="onMouseDown"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <div class="top-bar">
      <button
        class="return-btn pixel-frame"
        @mousedown.stop
        @click.stop="goBack"
      >
        Return
      </button>
    </div>

    <div class="panels">
      <div
        v-for="(c, i) in characters"
        :key="i"
        class="panel pixel-frame"
        :style="{
          backgroundColor: c.color,
          backgroundImage: 'url('+c.image+')',
          opacity: c.opacity
        }"
        @click="select(c)"
      >
        <div class="label pixel-box">{{ c.name }}</div>
      </div>
    </div>

    <!-- 角色详情面板 -->
    <div v-if="selectedCharacter" class="character-detail pixel-frame">
      <!-- 上部：头像 + 两行文字 -->
      <div class="detail-top">
        <div class="avatar">
          <img
            :src="selectedCharacter.avatarImage"
            alt="头像"
            style="width:100%; height:100%; object-fit:cover;"
          />
        </div>
        <div class="details">
          <div class="info-row">
            <span class="info-title">Char.:</span>
            <span class="info-text">{{ selectedCharacter.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-title">Pers.:</span>
            <span class="info-text">{{ selectedCharacter.personality }}</span>
          </div>
        </div>
      </div>

      <!-- 中部：解锁数量 -->
      <!-- 中部：解锁数量（点击触发面板） -->
<div class="unlock-panel pixel-frame" @click="showCgPanel = true" style="cursor:pointer;">
  CG unlocked:{{ selectedCharacter.skinUnlocked }} / {{ selectedCharacter.totalSkins }}
</div>

<!-- CG收集面板弹窗 -->
<div v-if="showCgPanel" class="cg-collection-popup" @click.self="showCgPanel = false">
  <div class="cg-collection-content pixel-frame">
    <div class="cg-collection-header">
      <span>{{ selectedCharacter?.name }}'s CG Collection</span>
      <button class="close-cg-btn" @click="showCgPanel = false">✕</button>
    </div>
    <div class="cg-grid">
      <div
        v-for="(cg, idx) in cgList"
        :key="idx"
        class="cg-thumb"
        :class="{ locked: !cg.unlocked }"
        @click.stop="cg.unlocked && openFullCg(cg.img, idx)"
      >
        <img v-if="cg.unlocked" :src="cg.img" :alt="'CG '+(idx+1)">
        <div v-else class="cg-locked">?</div>
      </div>
    </div>
  </div>
</div>

<!-- CG大图预览弹窗 -->
<div v-if="showFullCg" class="cg-full-popup" @click.self="showFullCg = false">
  <div class="cg-full-content pixel-frame">
    <img :src="fullCgImg" alt="CG Full" class="cg-full-image" />
    <button class="close-cg-btn" @click="showFullCg = false" style="position:absolute;top:12px;right:16px;">✕</button>
  </div>
</div>


      <!-- 底部：两个按钮 -->
      <div class="detail-footer"> 
        <button class="draw-btn pixel-frame" @click="drawSkin">
          Extr. (300 stars)
        </button>
        <button class="close-btn pixel-frame" @click="closeDetail">
          Close
        </button>
      </div>
    </div>

    <!-- 弹窗（不动） -->
    <div v-if="showPopup" class="draw-popup" @click="onPopupClick">
      <div class="popup-content pixel-frame">
        <p class="popup-text">
  Congratulations!<br>
  Get new CG!:<br>{{ lastSkinName }}
</p>

 <!-- —— 新增 CG 预览框 —— -->
      <div class="cg-container" v-if="lastSkinUrl">
        <img :src="lastSkinUrl" alt="New CG" class="cg-image" />
      </div>
        <button class="popup-btn" @click="closePopup">
          I know
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import img1 from './pic/1.png'
import img2 from './pic/2.png'
import img3 from './pic/3.png'
import img4 from './pic/4.png'
import img5 from './pic/5.png'
import av1  from './pic/11.jpg'
import av2  from './pic/22.jpg'
import av3  from './pic/33.jpg'
import av4  from './pic/44.jpg'
import av5  from './pic/55.jpg'

const emit = defineEmits(['openpanel','select'])

const wrapperRef = ref(null)
const posX        = ref(100)
const posY        = ref(100)
const panelW      = ref(0)
const panelH      = ref(0)

// 拖拽状态
let possibleDrag = false  // mousedown 后先标记“可能拖拽” 边界和拖拽的对应的位置！！ 把「点一下」和「拖拽」两件事分开处理，避免点选时因为手指或鼠标的细微抖动误触成拖拽
let dragging     = false  // 真正进入拖拽
let startX = 0, startY = 0
let offX   = 0, offY   = 0

const characters = ref([
  { name:'Rana',   color:'#EFFEEA', image:img1, opacity:0.8, skinUnlocked:8, totalSkins:16, personality:'Mysterious', avatarImage:av1 },
  { name:'Anon',   color:'#FFE9F2', image:img2, opacity:0.8, skinUnlocked:7, totalSkins:16,  personality:'Energetic', avatarImage:av2 },
  { name:'Tomori', color:'#ECECE7', image:img3, opacity:0.8, skinUnlocked:7, totalSkins:16, personality:'Introverted', avatarImage:av3 },
  { name:'Soyo',   color:'#FFF7DC', image:img4, opacity:0.8, skinUnlocked:8, totalSkins:16,  personality:'Supportive', avatarImage:av4 },
  { name:'Taki',   color:'#ECE5FF', image:img5, opacity:0.8,skinUnlocked:4, totalSkins:16,  personality:'Blunt', avatarImage:av5 },
])

const selectedCharacter = ref(null)
const showPopup    = ref(false)
const lastSkinName = ref('')

const electronAPI = window?.electronAPI ?? null
onMounted(() => {
  panelW.value = wrapperRef.value.offsetWidth
  panelH.value = wrapperRef.value.offsetHeight
  electronAPI?.setIgnoreMouseEvents(false)
})
onBeforeUnmount(() => {
  electronAPI?.setIgnoreMouseEvents(true)
})

// 鼠标按下：标记可能拖拽，并记录起始点
function onMouseDown(e) {
  if (e.button !== 0) return
  possibleDrag = true
  startX = e.clientX
  startY = e.clientY
  offX   = e.clientX - posX.value
  offY   = e.clientY - posY.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   onMouseUp)
}

// 鼠标移动：判断是否超过阈值，开始拖拽后 clamp
function onMouseMove(e) {
  const dx = Math.abs(e.clientX - startX)
  const dy = Math.abs(e.clientY - startY)

  // 超过 5px 视为拖拽
  if (!dragging && possibleDrag && (dx > 5 || dy > 5)) {
    dragging = true
    document.body.style.cursor = 'move'
  }

  if (dragging) {
    const w  = panelW.value
    const h  = panelH.value
    const vw = window.visualViewport?.width  ?? window.innerWidth
    const vh = window.visualViewport?.height ?? window.innerHeight

    const newX = e.clientX - offX
    const newY = e.clientY - offY

    posX.value = Math.min(-190+Math.max(newX, 0), vw - w-210)
    posY.value = Math.min(-40+Math.max(newY, 0), vh - h-50)
  }
}

// 鼠标抬起：重置状态
function onMouseUp() {
  possibleDrag = false
  dragging     = false
  document.body.style.cursor = ''
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup',   onMouseUp)
}

// 其余逻辑
function goBack()      { emit('openpanel','Fun3') }
function select(c)     { selectedCharacter.value = c }
function closeDetail() { selectedCharacter.value = null }
function drawSkin() {
  lastSkinName.value = `${selectedCharacter.value.name} New CG For you!!`
  showPopup.value    = true
}
function closePopup() { showPopup.value = false }
function disableClick(){ electronAPI?.setIgnoreMouseEvents(false) }
function enableClick() { electronAPI?.setIgnoreMouseEvents(true) }

const showCgPanel = ref(false)
const showFullCg = ref(false)
const fullCgImg = ref('')

// 假数据示例
const cgList = computed(() => {
  if (!selectedCharacter.value) return []
  const total = selectedCharacter.value.totalSkins
  const unlocked = selectedCharacter.value.skinUnlocked
  return Array.from({ length: total }, (_, i) => ({
    img: `https://i.bandori.party/u/c/art/a/5088Hina-Hikawa-Power-Kaleidoscopic-Brilliance-WXrTt3.png`,
    unlocked: i < unlocked,
  }))
})

function openFullCg(img, idx) {
  fullCgImg.value = img
  showFullCg.value = true
}
</script>

<script>
export default {
  data() {
    return {
      showPopup: true,
      lastSkinName: 'Anon CG!!!',
      // 点击弹窗时请求到的 CG 图片 URL
      lastSkinUrl: 'https://i.bandori.party/u/c/art/a/5009Anon-Chihaya-Happy-Wake-Up-Yawn-Time-wTaGpY.png'
    }
  },
  methods: {
    closePopup() {
      this.showPopup = false
      // 如果你还想在这里做别的逻辑，就继续写
    }
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.char-selection {
  position: fixed;
  width:500px; height:320px;
  background:#d8c4b2;
  border:2px solid #000;
  border-radius:10px 10px 16px 16px;
  box-shadow:3px 3px 0 #000;
  font-family:'Press Start 2P',monospace;
  user-select:none;
}

/* Return */
.return-btn {
  position:absolute; top:4px; right:4px;
  background:#f4edd9; border:3px solid #000;
  box-shadow:2px 2px 0 #000,-1px -1px 0 #000 inset;
  padding:4px 8px; font-size:8px; z-index:10;
}

.panels {
  display:flex; height:calc(100% - 40px); margin-top:33px;
}
.panel {
  flex:1; margin:0 3px; position:relative;
  background-size:cover; background-position:center;
  border:2px solid #000; box-shadow:2px 2px 0 #000 inset;
  transition:transform .2s,box-shadow .2s; cursor:pointer;
}
.panel:hover { transform:scale(1.03); box-shadow:2px 2px 0 #000; }

.panel .label {
  position:absolute; top:80%; left:50%;
  transform:translateX(-50%);
  background:#d7d6d1; border:1px solid #000;
  box-shadow:2px 2px 0 #000,-1px -1px 0 #000 inset;
  padding:4px 14px; font-size:8px; pointer-events:none;
}

/* 详情面板 */
/* ——— 重新排版的详情面板 ——— */
.character-detail {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  background: #f4e5e2;
  border: 3px solid #000;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 4px 4px 0 #000;
  z-index: 5;
}

/* 上部：头像 + 文字 */
.detail-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.detail-top .avatar {
  width: 80px;
  height: 80px;
  border: 3px solid #000;
  background: #fff;
  border-radius: 4px;
}
.details {
  flex: 1;
}
.details .info-row {
  margin-bottom: 8px;
  font-size: 10px;
}
.info-title {
  display: inline-block;
  width: 65px;
  font-weight: bold;
}
.info-text {
  display: inline-block;
}

/* 中部：大面板 */
.unlock-panel {
  width: 100%;
  height: 32px;
  background: #ffd4c7;
  border: 2px solid #000;
  box-shadow: 2px 2px 0 #000, -1px -1px 0 #000 inset;
  border-radius: 1px;
  line-height: 32px;
  text-align: center;
  font-size: 10px;
  margin: 12px 0;
}



/* 底部：按钮行 */
.detail-footer {
  display: flex;
  justify-content: space-between;
}
.draw-btn{
  width: 150px;
  height: 32px;
  line-height: 32px;
  background: #ffc79f;
  color: #fff;
  border: none;
  box-shadow: 2px 2px 0 #000;
  border-radius: 4px;
  font-size:8px;
  cursor: pointer;
  text-align: center; 
}

.close-btn {
  width: 100px;
  height: 32px;
  line-height: 32px;
  background: #fbaeae;
  color: #fff;
  border: none;
  box-shadow: 2px 2px 0 #000;
  border-radius: 4px;
  font-size:8px;
  cursor: pointer;
  text-align: center; 
}
.draw-btn:hover{
  transform: scale(1.05);
  background: #fcd55f;
}

.close-btn:hover {
  transform: scale(1.05);
  background: #f66767;
}
/* 抽取弹窗 */
.draw-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  animation: float 2s ease-in-out infinite; /* 添加浮动动画 */
}

@keyframes float {
  0%, 100% { transform: translate(-50%, -52%); }
  50% { transform: translate(-50%, -48%); }
}

/* 弹窗内容整体 */
.popup-content {
  background: #fff0e6;
  border: 4px solid #000;
  border-radius: 16px;
  padding: 20px;
  width: 300px;          /* 根据需要微调 */
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  text-align: center;
}

/* 文本 */
.popup-text {
  margin: 0 0 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #333;
}

/* —— 新增：CG 预览 —— */
.cg-container {
  width: 200px;
  height: 150px;
  margin: 0 auto 16px;     /* 顶部和按钮之间留一点空 */
  border: 2px solid #000;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cg-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 按钮 */
.popup-btn {
  background: #ffb380;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 0.6em 1.2em;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  cursor: pointer;
}
.popup-btn:hover {
  background: #ffa260;
}

/* 添加装饰性像素边框 */
.popup-content::before {

  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border: 2px dashed rgba(255,255,255,0.3);
  border-radius: 8px;
  pointer-events: none;
}



.popup-btn:hover {
  filter: brightness(1.1);
  transform: translate(-1px, -1px);
  box-shadow: 
    3px 3px 0 #000;
}

.popup-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 
    1px 1px 0 #000;
}

/* 添加按钮的像素风装饰 */
.popup-btn::after {
  content: "";
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: linear-gradient(
    45deg,
    transparent 25%,
    rgba(255,255,255,0.1) 25%,
    rgba(255,255,255,0.1) 50%,
    transparent 50%,
    transparent 75%,
    rgba(255,255,255,0.1) 75%
  );
  background-size: 4px 4px;
  opacity: 0.5;
  pointer-events: none;
}


/** CG 部分的内容 */

.cg-collection-popup {
  position: fixed;
  z-index: 200;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cg-collection-content {
  background: #fff9ef;
  border: 4px solid #000;
  border-radius: 14px;
  padding: 22px 28px 22px 28px;
  min-width: 340px;
  box-shadow: 0 8px 32px rgba(0,0,0,.19);
  animation: float .7s cubic-bezier(.4,2,.6,.8);
  position:relative;
}
.cg-collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: bold;
  color: #bf5a11;
  text-shadow:1px 1px 0 #fff;
}
.close-cg-btn {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: bold;
  color: #a22;
  cursor: pointer;
}
.cg-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.cg-thumb {
  width: 58px; height: 58px;
  background: #ffe4d2;
  border: 2px solid #000;
  border-radius: 7px;
  display: flex;
  align-items: center; justify-content: center;
  box-shadow: 1px 1px 0 #c9b68a;
  overflow: hidden;
  position: relative;
  font-size: 20px;
  cursor: pointer;
  transition: filter 0.15s, box-shadow 0.15s;
}
.cg-thumb img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .2s;
}
.cg-thumb.locked {
  filter: grayscale(0.8) brightness(1.3) blur(1px);
  background: #f8f8f8;
  color: #bbb;
  cursor: not-allowed;
}
.cg-locked {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; color: #ddd;
  font-family: 'Press Start 2P', monospace;
  background: repeating-linear-gradient(45deg, #ffe4d2, #fff2e6 8px, #ffe4d2 12px);
}

.cg-thumb:not(.locked):hover img {
  transform: scale(1.12);
  box-shadow:0 0 4px #eacb93;
}

.cg-full-popup {
  position: fixed;
  z-index: 210;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cg-full-content {
  background: #fff6ee;
  border: 5px solid #000;
  border-radius: 18px;
  box-shadow: 0 10px 32px rgba(0,0,0,0.21);
  position: relative;
  padding: 30px 24px;
  min-width: 350px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cg-full-image {
  max-width: 360px;
  max-height: 380px;
  border-radius: 8px;
  box-shadow: 2px 2px 0 #e8cfa7;
  border: 2.5px solid #000;
  background: #fff;
}



</style>




  




  
  
  
  
  
  

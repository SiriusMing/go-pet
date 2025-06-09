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
  CG unlocked: {{ skinUnlocked }} / {{ totalSkins}}

</div>

<!-- CG收集面板弹窗 -->
<div v-show="showCgPanel" class="cg-collection-popup" @click.self="showCgPanel = false">
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
          Extr. (150 stars)
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAchievements } from '../goal_manager.js' // 路径按你的项目结构调整
const emit = defineEmits(['openpanel', 'close'])

// 星星联动、刷新接口
const { stars, reloadAchievements } = useAchievements()

// 本地CG数据结构，key为角色名
function getCgStore() {
  return JSON.parse(localStorage.getItem('cgs') || '{}')
}
function setCgStore(store) {
  localStorage.setItem('cgs', JSON.stringify(store))
}

// 全角色全部CG图片（建议替换成你实际的CG图片资源数组！）
const allCgData = {
  'Rana':   [
    'https://i.bandori.party/u/c/art/4275Raana-Kaname-Pure-Like-A-Cat-9jgKlL.png',
    'https://i.bandori.party/u/c/art/4280Raana-Kaname-Happy-For-The-Rest-Of-Our-Lives-Beginning-Now-98M7DD.png',
    'https://i.bandori.party/u/c/art/4285Raana-Kaname-Cool-A-Kitten-Clawing-at-the-Guitar-otudPL.png',
    'https://i.bandori.party/u/c/art/a/4285Raana-Kaname-Cool-A-Kitten-Clawing-at-the-Guitar-Dejkmq.png',
    'https://i.bandori.party/u/c/art/4288Raana-Kaname-Power-At-Her-Own-Spontaneous-Pace-sAAQO0.png',
    'https://i.bandori.party/u/c/art/a/4288Raana-Kaname-Power-At-Her-Own-Spontaneous-Pace-4i9PBy.png',
    'https://i.bandori.party/u/c/art/4322Raana-Kaname-Power-IgEnnC.png',
    'https://i.bandori.party/u/c/art/a/4322Raana-Kaname-Power-vaZIER.png',
    'https://i.bandori.party/u/c/art/4784Raana-Kaname-Pure-Leisure-Time-kuXygT.png',
    'https://i.bandori.party/u/c/art/a/4784Raana-Kaname-Pure-Leisure-Time-yFMTIv.png',
    'https://i.bandori.party/u/c/art/4974Raana-Kaname-Pure-On-The-Way-Home-as-the-Snow-Dances-Around-E7gePe.png',
    'https://i.bandori.party/u/c/art/a/4974Raana-Kaname-Pure-On-The-Way-Home-as-the-Snow-Dances-Around-FyB9Gm.png',
    'https://i.bandori.party/u/c/art/5020Raana-Kaname-Happy-That-Day-On-The-Porch-6dx0SD.png',
    'https://i.bandori.party/u/c/art/a/5020Raana-Kaname-Happy-That-Day-On-The-Porch-9CcmLh.png',
    'https://i.bandori.party/u/c/art/5021Raana-Kaname-Cool-Hopefu-birthday-2MdlqV.png'

  ],
  'Anon':   [
    'https://i.bandori.party/u/c/art/4274Anon-Chihaya-Happy-Center-of-the-Band-RvkWN0.png',
    'https://i.bandori.party/u/c/art/4279Anon-Chihaya-Cool-For-The-Rest-Of-Our-Lives-Beginning-Now-oJnONW.png',
    'https://i.bandori.party/u/c/art/4284Anon-Chihaya-Cool-Someone-Who-Gets-Along-Well-With-2jS465.png',
    'https://i.bandori.party/u/c/art/a/4284Anon-Chihaya-Cool-Someone-Who-Gets-Along-Well-With-hjwSn9.png',
    'https://i.bandori.party/u/c/art/4291Anon-Chihaya-Pure-While-We-re-Lost-2Ylfjt.png',
    'https://i.bandori.party/u/c/art/a/4291Anon-Chihaya-Pure-While-We-re-Lost-zk08Jl.png',
    'https://i.bandori.party/u/c/art/4319Anon-Chihaya-Pure-Leader-Recommendation-zvWh0d.png',
    'https://i.bandori.party/u/c/art/a/4319Anon-Chihaya-Pure-Leader-Recommendation-IPogbs.png',
    'https://i.bandori.party/u/c/art/a/4804Anon-Chihaya-Cool-To-Celebrate-Cherry-Blossom-Viewing-O1JET0.png',
    'https://i.bandori.party/u/c/art/4918Anon-Chihaya-Power-Hopeful-birthday-nqjHTs.png',
    'https://i.bandori.party/u/c/art/4964Anon-Chihaya-Power-My-Usual-Order-E8SIT3.png',
    'https://i.bandori.party/u/c/art/a/4964Anon-Chihaya-Power-My-Usual-Order-poCxVb.png',
    'https://i.bandori.party/u/c/art/5009Anon-Chihaya-Happy-Wake-Up-Yawn-Time-bQ75qi.png',
    'https://i.bandori.party/u/c/art/a/5009Anon-Chihaya-Happy-Wake-Up-Yawn-Time-wTaGpY.png',
    'https://i.bandori.party/u/c/art/a/5017Anon-Chihaya-Cool-You-Want-Me-To-Go-Look-For-Her-87l7X1.png'
    
  ],
  'Tomori': [
    'https://i.bandori.party/u/c/art/4273Tomori-Takamatsu-Cool-Girl-Who-Sings-from-Her-Heart-XD9uOJ.png',
    'https://i.bandori.party/u/c/art/4278Tomori-Takamatsu-Happy-For-The-Rest-Of-Our-Lives-Beginning-Now-12JdHE.png',
    'https://i.bandori.party/u/c/art/4283Tomori-Takamatsu-Power-Mysterious-Little-Animal-j6NbMM.png',
    'https://i.bandori.party/u/c/art/a/4283Tomori-Takamatsu-Power-Mysterious-Little-Animal-XAtqM8.png',
    'https://i.bandori.party/u/c/art/4290Tomori-Takamatsu-Pure-The-Cries-of-My-Heart-zP3n2p.png',
    'https://i.bandori.party/u/c/art/a/4290Tomori-Takamatsu-Pure-The-Cries-of-My-Heart-Rcb3vO.png',
    'https://i.bandori.party/u/c/art/4320Tomori-Takamatsu-Power-Next-To-Taki-zOwLeo.png',
    'https://i.bandori.party/u/c/art/a/4320Tomori-Takamatsu-Power-Next-To-Taki-K8BXBc.png',
    'https://i.bandori.party/u/c/art/4765Tomori-Takamatsu-Power-Relaxed-Dialogue-ApmqmL.png',
    'https://i.bandori.party/u/c/art/a/4765Tomori-Takamatsu-Power-Relaxed-Dialogue-DsUdtn.png',
    'https://i.bandori.party/u/c/art/a/4787Tomori-Takamatsu-Cool-The-Card-of-Destiny-zNNrSD.png',
    'https://i.bandori.party/u/c/art/4968Tomori-Takamatsu-Cool-Hopeful-birthday-Q0hCrQ.png',
    'https://i.bandori.party/u/c/art/a/4991Tomori-Takamatsu-Happy-One-Lost-Star-KstHC0.png',
    'https://i.bandori.party/u/c/art/a/5019Tomori-Takamatsu-Happy-Through-The-Back-Alley-KvPsa1.png',
    'https://i.bandori.party/u/c/art/a/5040Tomori-Takamatsu-Pure-Resonance-of-Joyous-Stars-1KRqxO.png'

  ],
  'Soyo':   ['https://i.bandori.party/u/c/art/4276Soyo-Nagasaki-Power-Everyone-s-Mother-XbCJhk.png',
  'https://i.bandori.party/u/c/art/4281Soyo-Nagasaki-Cool-For-The-Rest-Of-Our-Lives-Beginning-Now-Liqy8v.png',
  'https://i.bandori.party/u/c/art/4286Soyo-Nagasaki-Happy-The-Calm-Mediator-WAPlu3.png',
  'https://i.bandori.party/u/c/art/a/4286Soyo-Nagasaki-Happy-The-Calm-Mediator-7B3cl3.png',
  'https://i.bandori.party/u/c/art/4292Soyo-Nagasaki-Pure-I-ll-Put-An-End-To-This-lfm2Ap.png',
  'https://i.bandori.party/u/c/art/a/4292Soyo-Nagasaki-Pure-I-ll-Put-An-End-To-This-zRazob.png',
  'https://i.bandori.party/u/c/art/4786Soyo-Nagasaki-Cool-An-Eternal-Rain-ftlKBp.png',
  'https://i.bandori.party/u/c/art/a/4786Soyo-Nagasaki-Cool-An-Eternal-Rain-erk22Y.png',
  'https://i.bandori.party/u/c/art/4858Soyo-Nagasaki-Happy-Hopeful-birthday-hz1MW3.png',
  'https://i.bandori.party/u/c/art/4993Soyo-Nagasaki-Power-The-Name-of-This-Relationship-Is-HukL92.png',
  'https://i.bandori.party/u/c/art/a/4993Soyo-Nagasaki-Power-The-Name-of-This-Relationship-Is-6c099e.png',
  'https://i.bandori.party/u/c/art/5018Soyo-Nagasaki-Happy-This-One-Over-Here-Rpzuz4.png',
  'https://i.bandori.party/u/c/art/a/5018Soyo-Nagasaki-Happy-This-One-Over-Here-ydph8E.png',
  'https://i.bandori.party/u/c/art/5038Soyo-Nagasaki-Pure-A-Moment-Before-The-Curtain-qOUyuu.png',
  'https://i.bandori.party/u/c/art/a/5038Soyo-Nagasaki-Pure-A-Moment-Before-The-Curtain-bA4U5e.png'
    
  ],
  'Taki':   ['https://i.bandori.party/u/c/art/4277Taki-Shiina-Power-Rhythm-Re-Start-Zdg4nA.png',
    "https://i.bandori.party/u/c/art/4282Taki-Shiina-Cool-For-The-Rest-Of-Our-Lives-Beginning-Now-IKiwQ1.png",
    'https://i.bandori.party/u/c/art/4287Taki-Shiina-Pure-Protector-of-the-Past-lQXixl.png',
    'https://i.bandori.party/u/c/art/a/4287Taki-Shiina-Pure-Protector-of-the-Past-NpyCWE.png',
    'https://i.bandori.party/u/c/art/4289Taki-Shiina-Happy-Falling-Short-of-My-Ideals-Wo6FES.png',
    'https://i.bandori.party/u/c/art/a/4289Taki-Shiina-Happy-Falling-Short-of-My-Ideals-dKpP0U.png',
    'https://i.bandori.party/u/c/art/4321Taki-Shiina-Power-Let-s-Make-A-Deal-SfTCf5.png',
    'https://i.bandori.party/u/c/art/a/4321Taki-Shiina-Power-Let-s-Make-A-Deal-dwJUh1.png',
    'https://i.bandori.party/u/c/art/4785Taki-Shiina-Cool-More-Than-Just-Grabbing-Take-Out-HEh4Sk.png',
    'https://i.bandori.party/u/c/art/a/4785Taki-Shiina-Cool-More-Than-Just-Grabbing-Take-Out-DvzxYH.png',
    'https://i.bandori.party/u/c/art/4902Taki-Shiina-Pure-Hopeful-birthday-MESyZA.png',
    'https://i.bandori.party/u/c/art/4966Taki-Shiina-Happy-Thank-You-For-Waiting-7QIza0.png',
    'https://i.bandori.party/u/c/art/a/4966Taki-Shiina-Happy-Thank-You-For-Waiting-WHj5SL.png',
    'https://i.bandori.party/u/c/art/5028Taki-Shiina-Cool-You-Over-The-Counter-Z8Bg2Y.png',
    'https://i.bandori.party/u/c/art/a/5028Taki-Shiina-Cool-You-Over-The-Counter-cPXbZn.png'


  ]
}

// 保证初始每个角色2张CG已解锁
function ensureInitCg() {
  const store = getCgStore()
  for (const name of Object.keys(allCgData)) {
    if (!store[name] || store[name].length < 2) {
      store[name] = [0, 1]
    }
  }
  setCgStore(store)
}
onMounted(() => { ensureInitCg(); cgStore.value = getCgStore() })

// 拖拽相关（你的代码保留不变）
const wrapperRef = ref(null)
const posX        = ref(100)
const posY        = ref(100)
const panelW      = ref(0)
const panelH      = ref(0)
let possibleDrag = false, dragging = false
let startX = 0, startY = 0, offX = 0, offY = 0

onMounted(() => {
  panelW.value = wrapperRef.value.offsetWidth
  panelH.value = wrapperRef.value.offsetHeight
  electronAPI?.setIgnoreMouseEvents(false)
})
onBeforeUnmount(() => {
  electronAPI?.setIgnoreMouseEvents(true)
})
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
function onMouseMove(e) {
  const dx = Math.abs(e.clientX - startX)
  const dy = Math.abs(e.clientY - startY)
  if (!dragging && possibleDrag && (dx > 5 || dy > 5)) {
    dragging = true
    document.body.style.cursor = 'move'
  }
  if (dragging) {
    const w  = panelW.value, h = panelH.value
    const vw = window.visualViewport?.width  ?? window.innerWidth
    const vh = window.visualViewport?.height ?? window.innerHeight
    const newX = e.clientX - offX, newY = e.clientY - offY
    posX.value = Math.min(-190+Math.max(newX, 0), vw - w-210)
    posY.value = Math.min(-40+Math.max(newY, 0), vh - h-50)
  }
}
function onMouseUp() {
  possibleDrag = false
  dragging     = false
  document.body.style.cursor = ''
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup',   onMouseUp)
}

const electronAPI = window?.electronAPI ?? null
function disableClick(){ electronAPI?.setIgnoreMouseEvents(false) }
function enableClick() { electronAPI?.setIgnoreMouseEvents(true) }

// 角色静态信息
import img1 from './pic/1.png';  import img2 from './pic/2.png';  import img3 from './pic/3.png';
import img4 from './pic/4.png';  import img5 from './pic/5.png';
import av1  from './pic/11.jpg'; import av2  from './pic/22.jpg'; import av3  from './pic/33.jpg';
import av4  from './pic/44.jpg'; import av5  from './pic/55.jpg';
const characters = ref([
  { name:'Rana',   color:'#EFFEEA', image:img1, opacity:0.8, personality:'Mysterious', avatarImage:av1 },
  { name:'Anon',   color:'#FFE9F2', image:img2, opacity:0.8, personality:'Energetic', avatarImage:av2 },
  { name:'Tomori', color:'#ECECE7', image:img3, opacity:0.8, personality:'Introverted', avatarImage:av3 },
  { name:'Soyo',   color:'#FFF7DC', image:img4, opacity:0.8, personality:'Supportive', avatarImage:av4 },
  { name:'Taki',   color:'#ECE5FF', image:img5, opacity:0.8, personality:'Blunt', avatarImage:av5 },
])

const selectedCharacter = ref(null)

// ==================== 下面是CG抽卡联动核心 ====================
const cgStore = ref(getCgStore()) // 全局CG本地存储

// 当前选中角色的CG列表（解锁状态）
const cgList = computed(() => {
  if (!selectedCharacter.value) return []
  const charName = selectedCharacter.value.name
  const allCgs = allCgData[charName] || []
  const unlockedIdx = new Set((cgStore.value[charName] || []))
  return allCgs.map((url, i) => ({
    img: url,
    unlocked: unlockedIdx.has(i),
    idx: i,
  }))
})
const skinUnlocked = computed(() => {
  if (!selectedCharacter.value) return 0
  return (cgStore.value[selectedCharacter.value.name] || []).length
})
const totalSkins = computed(() =>
  (selectedCharacter.value && allCgData[selectedCharacter.value.name]?.length) || 0
)

// 详情面板按钮、弹窗、CG大图预览
const showPopup    = ref(false)
const showCgPanel  = ref(false)
const showFullCg   = ref(false)
const fullCgImg    = ref('')
const lastSkinName = ref('')
const lastSkinUrl  = ref('')
const message      = ref('')

// 选中角色后，强制刷新数据（保证同步localStorage最新解锁）
function select(c) {
  selectedCharacter.value = c
  cgStore.value = getCgStore()
}
function closeDetail() { selectedCharacter.value = null }
function goBack()      { emit('openpanel','Fun3') }

// 关闭弹窗
function closePopup() { showPopup.value = false }
function onPopupClick() { showPopup.value = false }

// 抽取CG按钮逻辑（消耗星星、写入本地、刷新联动）
function drawSkin() {
  if (!selectedCharacter.value) return
  const name = selectedCharacter.value.name
  let unlocked = cgStore.value[name] || []
  const allCgs = allCgData[name] || []
  const total = allCgs.length
  const lockedIdx = [...Array(total).keys()].filter(i => !unlocked.includes(i))
  if (!lockedIdx.length) {
    message.value = "All CGs unlocked!"
    showPopup.value = true
    return
  }
  if (stars.value < 150) {
    message.value = "Not enough stars!"
    showPopup.value = true
    return
  }
  // 随机抽取未解锁CG
  const newIdx = lockedIdx[Math.floor(Math.random() * lockedIdx.length)]
  unlocked = [...unlocked, newIdx]
  const nextStore = { ...cgStore.value, [name]: unlocked }
  setCgStore(nextStore)
  cgStore.value = nextStore
  
  const userStars = Number(localStorage.getItem('user_stars') || '1000')
  localStorage.setItem('user_stars', String(userStars - 150))

  reloadAchievements() // 触发星星和成就重新计算

  // 展示新解锁CG弹窗
  lastSkinName.value = `${name} CG #${newIdx + 1}`
  lastSkinUrl.value  = allCgs[newIdx]
  message.value      = "Congratulations!"
  showPopup.value    = true
}

// CG大图预览
function openFullCg(img, idx) {
  fullCgImg.value = img
  showFullCg.value = true
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
  position: absolute;
  z-index: 200;
  left: 50%;   /* 固定在屏幕中心 */
  top: 50%;    /* 固定在屏幕中心 */
  transform: translate(-50%, -50%); /* 居中 */
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease; /* 平滑过渡 */
}

.cg-collection-content {
  background: #fff9ef;
  border: 4px solid #000;
  border-radius: 14px;
  padding: 22px 28px 22px 28px;
  min-width: 340px;
  box-shadow: 0 8px 32px rgba(0,0,0,.19);
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




  




  
  
  
  
  
  

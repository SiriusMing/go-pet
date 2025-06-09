<template>
  <div
    ref="wrapperRef"
    class="profile-card"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="startDrag"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <div class="profile-header">
      <span class="profile-icon">📋</span>
      <span class="profile-title">Profile Info</span>
    </div>
    <div class="avatar-wrapper">
      <img :src="avatar" alt="Avatar" />
    </div>
    <div class="profile-info-table">
      <div class="row">
        <span class="label">Name:</span>
        <span class="value">{{ profile.name }}</span>
      </div>
      <div class="row">
        <span class="label">Email:</span>
        <span class="value">{{ profile.email }}</span>
      </div>
      <div class="row">
        <span class="label">Phone:</span>
        <span class="value">{{ profile.phone_number }}</span>
      </div>
      <div class="row">
        <span class="label">Gender:</span>
        <span class="value">{{ profile.gender }}</span>
      </div>
    </div>
    <button class="back-btn" @click="closePanel">← Back</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import avatarPic from '@renderer/components/chat/photo/mxr.png'
import axios from 'axios'

const emit = defineEmits(['close'])

// 头像相关
const avatar = ref(localStorage.getItem('local_avatar') || avatarPic) // 优先本地头像，没有就用默认图

const profile = ref({
  name: '', email: '', phone: '', gender: ''
})
const token = localStorage.getItem('accessToken') || ''

// 拉取 API 信息（不报错，不跳转，不 alert）
async function fetchUserProfile() {
  try {
    const res = await axios.get('https://gps.primedigitaltech.com:9220/api/getUserInfo/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    profile.value = res.data
  } catch (err) {
    // 静默失败
  }
}

// 本地上传头像并保存
function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    avatar.value = ev.target.result
    localStorage.setItem('local_avatar', avatar.value)
  }
  reader.readAsDataURL(file)
}

// 页面加载拉取资料和本地头像
onMounted(() => {
  fetchUserProfile()
  avatar.value = localStorage.getItem('local_avatar') || avatarPic
})

function closePanel() { emit('close') }

onMounted(() => { fetchUserProfile() })
// 允许外部调用刷新
defineExpose({ fetchUserProfile })

// 拖拽逻辑
const wrapperRef = ref(null), panelW = ref(0), panelH = ref(0)
const posX = ref(0), posY = ref(0)
let dragging = false, offX = 0, offY = 0
onMounted(async () => {
  await nextTick()
  panelW.value = wrapperRef.value.offsetWidth
  panelH.value = wrapperRef.value.offsetHeight
  posX.value = (window.innerWidth - panelW.value) / 2
  posY.value = (window.innerHeight - panelH.value) / 2
  disableClick()
  fetchUserProfile()
})
function startDrag(e) {
  if (e.button !== 0) return
  if (e.target.classList.contains('close-btn')) return
  dragging = true
  offX = e.clientX - posX.value
  offY = e.clientY - posY.value
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
}
function onDrag(e) {
  if (!dragging) return
  const w = panelW.value, h = panelH.value
  posX.value = Math.min(Math.max(e.clientX - offX, 0), window.innerWidth - w)
  posY.value = Math.min(Math.max(e.clientY - offY, 0), window.innerHeight - 310)
}
function endDrag() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
}
const electronAPI = window?.electronAPI ?? null
function disableClick() { electronAPI?.setIgnoreMouseEvents(false) }
function enableClick()  { electronAPI?.setIgnoreMouseEvents(true) }
onBeforeUnmount(() => enableClick())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
body, .profile-card { font-family: 'Press Start 2P', monospace !important; }
.profile-card {
  position: fixed;
  min-width: 380px;
  min-height: 250px;
  background: linear-gradient(145deg, #fec89a 70%, #FFAE42 100%);
  border-radius: 20px;
  box-shadow: 12px 12px 0 #000;
  padding: 22px 26px 0 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  z-index: 99999;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}
.profile-icon {
  font-size: 18px;
}
.profile-title {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  margin-left: 4px;
  margin-bottom: 3px;
  color: #222;
  text-shadow: 2px 2px 0 #fff, 4px 4px 0 #000;
}
.avatar-wrapper {
  margin: 0 0 8px 0;
}
.avatar-wrapper img {
  width: 65px;
  height: 65px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #222;
  box-shadow: 4px 4px 0 #000, 0 2px 18px #ffc10755;
  background: #fff;
  margin-bottom: 6px;
}
.profile-info-table {
  width: 98%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 14px;
  margin: 0 auto 10px auto;
  font-family: inherit;
  font-weight: bold;
  color: #222;
  letter-spacing: 1.5px;
}
.profile-info-table .row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: 3px;
}
.profile-info-table .label {
  min-width: 130px;
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  margin-right: 16px;
  color: #222;
  font-family: inherit;
  letter-spacing: 2.5px;
}
.profile-info-table .value {
  font-size: 14px;
  font-family: inherit;
  color: #222;
  letter-spacing: 1.5px;
}
.back-btn {
  margin: 26px auto 16px auto;
  background: #fff;
  color: #111;
  border: none;
  border-radius: 12px;
  padding: 12px 35px;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 7px 7px 0 #000;
  cursor: pointer;
  letter-spacing: 2px;
  transition: background 0.16s, box-shadow 0.16s;
  display: block;
}
.back-btn:hover {
  background: #ffe5b4;
  box-shadow: 3px 3px 0 #000;
  color: #e67e22;
}
</style>





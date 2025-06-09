<template>
  <div
    ref="wrapperRef"
    class="settings-card"
    :style="wrapperStyle"
    @mousedown="startDrag"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <div class="settings-header">
      <span class="settings-icon">👤</span>
      <span class="settings-title">User Profile</span>
    </div>
    <form class="profile-form" @submit.prevent="saveProfile">
      <div class="form-row">
        <label for="name">Name:</label>
        <input id="name" v-model="name" type="text" required autocomplete="off"/>
      </div>
      <div class="form-row">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required autocomplete="off"/>
      </div>
      <div class="form-row">
        <label for="phone">Phone:</label>
        <input id="phone" v-model="phone" type="text" required autocomplete="off"/>
      </div>
      <div class="form-row">
        <label for="gender">Gender:</label>
        <select id="gender" v-model="gender" required>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-row">
        <label>Avatar:</label>
        <div class="avatar-input-wrapper">
          <input
            type="file"
            accept="image/*"
            class="avatar-input"
            @change="onAvatarChange"
          />
          <img v-if="avatar" :src="avatar" class="avatar-preview" />
        </div>
      </div>

      <button class="save-btn" type="submit">
        <span class="icon">💾</span> Save
      </button>
    </form>

    <p class="version-info">Version: v1.22.22</p>
    <button class="back-btn" @click="closePanel">← Back</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import axios from 'axios'
const emit = defineEmits(['close'])

const SCALE = 0.5 // 缩放比例

const name = ref('')
const email = ref('')
const phone = ref('')
const gender = ref('Male')

const token = localStorage.getItem('accessToken') || ''

// 拖拽与缩放坐标
const wrapperRef = ref(null)
const panelW = ref(0), panelH = ref(0)
const posX = ref(0), posY = ref(0)
let dragging = false, offX = 0, offY = 0

const wrapperStyle = computed(() => ({
  left: posX.value + 'px',
  top: posY.value + 'px',
  transform: `scale(${SCALE})`,
  transformOrigin: 'top left',
  zIndex: 99999
}))

onMounted(async () => {
  await nextTick()
  panelW.value = wrapperRef.value.offsetWidth * SCALE
  panelH.value = wrapperRef.value.offsetHeight * SCALE
  posX.value = (window.innerWidth - panelW.value) / 2
  posY.value = (window.innerHeight - panelH.value) / 2
  disableClick()
  // 拉取个人资料
  try {
    const res = await axios.get('/api/profile/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    // 检查后端返回字段名，部分后端用 phone_number
    name.value = res.data.name || ''
    email.value = res.data.email || ''
    phone.value = res.data.phone_number || res.data.phone || ''
    gender.value = res.data.gender || 'Male'
  } catch (err) {
    alert('❌ 无法获取用户信息，请重新登录')
    // 你可以 emit('close')，也可以跳转登录页
    closePanel()
  }
})

const avatar = ref(localStorage.getItem('local_avatar') || '') // 页面加载优先读取本地头像

function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    avatar.value = ev.target.result
    localStorage.setItem('local_avatar', avatar.value) // 存到本地
  }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  const headers = { Authorization: `Bearer ${token}` }
  try {
    await axios.post('https://gps.primedigitaltech.com:9220/api/modify/name/', { name: name.value }, { headers })
    await axios.post('https://gps.primedigitaltech.com:9220/api/modify/email/', { email: email.value }, { headers })
    await axios.post('https://gps.primedigitaltech.com:9220/api/modify/phone_number/', { phone_number: phone.value }, { headers })
    await axios.post('https://gps.primedigitaltech.com:9220/api/modify/gender/', { gender: gender.value }, { headers })
    alert("✅ The modification information has been submitted!")
    emit('profile-updated')
    closePanel()
  } catch (error) {
    // 可以输出更详细的错误原因
    if (error.response && error.response.status === 401) {
      alert("❌ Token 失效，请重新登录！")
    } else {
      alert("❌ Submission failed. Please check your network or login status!")
    }
  }
}

// 拖拽，坐标要除以SCALE进行修正
function startDrag(e) {
  if (e.button !== 0) return // 仅左键拖动
  dragging = true
  offX = (e.clientX - posX.value) / SCALE
  offY = (e.clientY - posY.value) / SCALE
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
}
function onDrag(e) {
  if (!dragging) return
  const w = panelW.value, h = panelH.value
  posX.value = Math.min(Math.max(e.clientX - offX * SCALE, 0), window.innerWidth - w)
  posY.value = Math.min(Math.max(e.clientY - offY * SCALE, 0), window.innerHeight - h)
}
function endDrag() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
}

// 穿透
const electronAPI = window?.electronAPI ?? null
function disableClick() { electronAPI?.setIgnoreMouseEvents(false) }
function enableClick()  { electronAPI?.setIgnoreMouseEvents(true) }
onBeforeUnmount(() => enableClick())

function closePanel() {
  enableClick()
  emit('close')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
body, .settings-card { font-family: 'Press Start 2P', monospace !important; }
.settings-card {
  position: fixed;
  min-width: 760px;
  min-height: 630px;
  background: linear-gradient(145deg, #fec89a 70%, #FFAE42 100%);
  border-radius: 20px;
  box-shadow: 12px 12px 0 #000;
  padding: 44px 44px 0 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  z-index: 99999;
}
.settings-header {
  display: flex;
  align-items: center;
  gap: 18px;
  justify-content: center;
  margin-bottom: 28px;
}
.settings-icon {
  font-size: 38px;
}
.settings-title {
  font-size: 48px;
  font-weight: bold;
  letter-spacing: 2px;
  margin-left: 8px;
  margin-bottom: 4px;
  color: #222;
  text-shadow: 2px 2px 0 #fff, 4px 4px 0 #000;
}
.profile-form {
  width: 100%;
  max-width: 820px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
}
.form-row {
  width: 95%;
  display: flex;
  align-items: center;
  font-size: 28px;
  margin-bottom: 20px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #222;
  justify-content: flex-start;
}
.form-row label {
  min-width: 170px;
  text-align: right;
  font-size: 28px;
  margin-right: 16px;
}
.form-row input,
.form-row select {
  flex: 1;
  padding: 8px 12px;
  font-size: 24px;
  font-family: 'Press Start 2P', monospace;
  border-radius: 10px;
  border: 2.5px solid #aaa;
  outline: none;
  margin-left: 4px;
  background: #fff;
}
.form-row select {
  min-width: 200px;
}
.avatar-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.avatar-input {
  width: 220px;
  font-family: 'Press Start 2P', monospace;
  font-size: 15px;
  border-radius: 10px;
  border: 2px solid #aaa;
  padding: 3px 7px;
  background: #fff;
  outline: none;
  box-sizing: border-box;
}
.avatar-preview {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #333;
  background: #fff;
  box-shadow: 2px 2px 0 #888;
}
.save-btn {
  background: #fff;
  color: #111;
  border: none;
  border-radius: 12px;
  padding: 16px 58px;
  font-family: 'Press Start 2P', monospace;
  font-size: 27px;
  font-weight: bold;
  box-shadow: 7px 7px 0 #000;
  cursor: pointer;
  letter-spacing: 2px;
  margin: 24px auto 12px auto;
  transition: background 0.16s, box-shadow 0.16s;
  display: block;
}
.save-btn:hover {
  background: #ffe5b4;
  box-shadow: 3px 3px 0 #000;
  color: #e67e22;
}
.version-info {
  text-align: center;
  color: #999;
  margin: 22px 0 16px 0;
  font-size: 22px;
  letter-spacing: 2.5px;
}
.back-btn {
  background: #fff;
  color: #111;
  border: none;
  border-radius: 12px;
  padding: 17px 68px;
  font-family: 'Press Start 2P', monospace;
  font-size: 28px;
  font-weight: bold;
  box-shadow: 7px 7px 0 #000;
  cursor: pointer;
  letter-spacing: 2px;
  margin-bottom: 30px;
  display: block;
}
.back-btn:hover {
  background: #ffe5b4;
  box-shadow: 3px 3px 0 #000;
  color: #e67e22;
}
</style>


<template>
  <div class="login-container"
    ref="wrapperRef"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="startDrag"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <div class="login-box">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="closeWindow">X</button>

      <h2>System Login</h2>
      <div class="form-item">
        <label>Username</label>
        <input v-model="username" type="text" placeholder="Please enter username" />
        <div v-if="usernameError" class="error-tip">{{ usernameError }}</div>
      </div>
      <div class="form-item">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Please enter password" />
        <div v-if="passwordError" class="error-tip">{{ passwordError }}</div>
      </div>
      <button class="login-btn" :disabled="isLoading" @click="doLogin">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
      <div v-if="loginError" class="error-message">{{ loginError }}</div>

      <div v-if="accessToken" class="token-container">
        <h3>Login Successful!</h3>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const usernameError = ref('')
const passwordError = ref('')
const loginError = ref('')
const isLoading = ref(false)
const accessToken = ref('')

function validateForm() {
  let valid = true
  
  // Reset error messages
  usernameError.value = ''
  passwordError.value = ''
  loginError.value = ''
  
  if (!username.value.trim()) {
    usernameError.value = 'Username cannot be empty'
    valid = false
  }
  
  if (!password.value) {
    passwordError.value = 'Password cannot be empty'
    valid = false
  }
  
  return valid
}

async function doLogin() {
  if (!validateForm()) return

  isLoading.value = true
  accessToken.value = ''
  loginError.value = ''

  try {
    const response = await fetch('https://gps.primedigitaltech.com:9220/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    isLoading.value = false

    if (response.ok) {
      const data = await response.json()
      accessToken.value = data.access

      // 登录成功后保存 token，并进行路由跳转
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('accessToken', data.access)

      // 跳转到主页面
      setTimeout(() => {
        router.push('/mainpage') // 跳转到主页面
      }, 100)
    } else {
      const errorData = await response.json().catch(() => null)
      if (response.status === 401 || response.status === 400) {
        loginError.value = errorData?.detail || 'Invalid username or password'
      } else {
        loginError.value = `Login failed, please try again later (Status: ${response.status})`
      }
    }
  } catch (error) {
    loginError.value = 'An unexpected error occurred. Please try again later.'
    isLoading.value = false
  }
}

// 关闭窗口的方法
function closeWindow() {
  // 关闭窗口
  window.close()
}

// 容器 & 拖拽
const wrapperRef = ref(null)
const panelW = ref(0), panelH = ref(0)
const posX = ref(0), posY = ref(0)
onMounted(async () => {
  await nextTick()
  panelW.value = wrapperRef.value.offsetWidth
  panelH.value = wrapperRef.value.offsetHeight
  posX.value = (window.innerWidth - panelW.value) / 2
  posY.value = (window.innerHeight - panelH.value) / 2
})

let dragging = false, offX = 0, offY = 0

function startDrag(e) {
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
  posY.value = Math.min(Math.max(e.clientY - offY, 0), window.innerHeight - h)
}

function endDrag() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
}

// 鼠标穿透
const electronAPI = window?.electronAPI ?? null

function disableClick() { electronAPI?.setIgnoreMouseEvents(false) }
function enableClick()  { electronAPI?.setIgnoreMouseEvents(true) }

onBeforeUnmount(() => {
  enableClick(); // 清除鼠标穿透事件
})
</script>


<style scoped>
/* 8-bit 像素风格，与主页一致 */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: transparent; /* Set the background to be transparent */
  position: fixed; /* Fix the login screen in place */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000; /* Make sure the login form is on top */
  pointer-events: auto; /* Ensure login form is clickable */
}

.login-box {
  width: 420px;
  padding: 25px;
  background: #FAE1DD;
  border: 4px solid #000;
  box-shadow: 
    6px 6px 0 #000,
    -3px -3px 0 #000 inset;
  border-radius: 8px;
  image-rendering: pixelated;
  pointer-events: auto; /* Ensure the login box is clickable */
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f8f8f8;  /* 8-bit 复古背景 */
  border: 2px solid #000;  /* 黑色边框，符合像素风格 */
  font-family: 'Press Start 2P', monospace;  /* 像素风格的字体 */
  font-size: 12px;  /* 较小的字体大小 */
  color: #000;  /* 黑色字体 */
  cursor: pointer;
  padding: 5px 10px;  /* 增加按钮的可点击区域 */
  text-align: center;
  border-radius: 4px;  /* 轻微的圆角 */
  image-rendering: pixelated;  /* 保持像素化效果 */
}

.close-btn:hover {
  color: #ff0000;  /* 红色字体 */
  background-color: #eee;  /* 鼠标悬停时的背景色 */
  box-shadow: 2px 2px 0 #000, -1px -1px 0 #000 inset;  /* 更明显的像素阴影 */
}

.close-btn:active {
  background-color: #ddd;  /* 按下时背景颜色 */
  box-shadow: 1px 1px 0 #000, -1px -1px 0 #000 inset;  /* 压下效果 */
}


h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #000;
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  text-shadow: 2px 2px 0 #ccc;
}

.form-item {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #000;
  text-shadow: 1px 1px 0 #fff;
}

input {
  width: 100%;
  padding: 12px;
  border: 3px solid #000;
  box-shadow: 
    2px 2px 0 #000,
    -1px -1px 0 #000 inset;
  border-radius: 4px;
  box-sizing: border-box;
  background: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  image-rendering: pixelated;
}

input:focus {
  outline: none;
  background: #f0f8ff;
  filter: brightness(1.1);
}

input::placeholder {
  color: #666;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: #BDE0FE;
  color: #000;
  border: 3px solid #000;
  box-shadow: 
    4px 4px 0 #000,
    -2px -2px 0 #000 inset;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  margin-top: 8px;
  transition: none;
  image-rendering: pixelated;
}

.login-btn:hover {
  filter: brightness(1.3);
  transform: translate(1px, 1px);
  box-shadow: 
    3px 3px 0 #000,
    -2px -2px 0 #000 inset;
}

.login-btn:disabled {
  background: #ddd;
  color: #999;
  cursor: not-allowed;
  filter: none;
  transform: none;
}

.error-tip {
  color: #ff0000;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  margin-top: 4px;
  text-shadow: 1px 1px 0 #fff;
}

.error-message {
  color: #ff0000;
  text-align: center;
  margin-top: 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  text-shadow: 1px 1px 0 #fff;
}

/* Token related styles - 8-bit 风格 */
.token-container {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9eb;
  border: 3px solid #000;
  box-shadow: 
    4px 4px 0 #000,
    -2px -2px 0 #000 inset;
  border-radius: 6px;
  image-rendering: pixelated;
}

.token-container h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #000;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  text-shadow: 1px 1px 0 #67c23a;
}

.token-info {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #000;
}

.token-value {
  margin-top: 8px;
  padding: 10px;
  background: #f8f8f8;
  border: 2px solid #000;
  box-shadow: 
    2px 2px 0 #000,
    -1px -1px 0 #000 inset;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  max-height: 80px;
  overflow-y: auto;
  font-size: 10px;
  image-rendering: pixelated;
}

/* 滚动条样式 - 8-bit 风格 */
.token-value::-webkit-scrollbar {
  width: 12px;
}

.token-value::-webkit-scrollbar-track {
  background: #f1f1f1;
  border: 1px solid #000;
}

.token-value::-webkit-scrollbar-thumb {
  background: #888;
  border: 1px solid #000;
}

.token-value::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

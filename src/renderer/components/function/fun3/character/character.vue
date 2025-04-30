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
        <span class="title">角色选择</span>
        <button
          class="return-btn pixel-frame"
          @mousedown.stop
          @click.stop="goBack"
        >
          返回
        </button>
      </div>

      <!-- 五个矩形面板 -->
      <div class="panels">
        <div
          v-for="(c, i) in characters"
          :key="i"
          class="panel pixel-frame"
          :style="{ backgroundColor: c.color }"
          @click="select(c)"
        >
          <div class="label pixel-box">{{ c.name }}</div>
        </div>
      </div>
    </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  // 接收并发射事件
  const emit = defineEmits(['openpanel','select'])

  // 拖拽状态
  const wrapperRef = ref(null)
  const posX = ref(100)
  const posY = ref(100)
  let dragging = false
  let startX = 0, startY = 0, originX = 0, originY = 0

  function startDrag(e) {
    if (e.button !== 0) return      // 只要左键
    dragging = true
    startX = e.clientX; startY = e.clientY
    originX = posX.value; originY = posY.value
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', endDrag)
  }
  function onDrag(e) {
    if (!dragging) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    const w = wrapperRef.value.offsetWidth
    const h = wrapperRef.value.offsetHeight
    let nx = originX + dx
    let ny = originY + dy
    // 限制到视口
    nx = Math.min(Math.max(0, nx), window.innerWidth  - w)
    ny = Math.min(Math.max(0, ny), window.innerHeight - h)
    posX.value = nx
    posY.value = ny
  }
  function endDrag() {
    dragging = false
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', endDrag)
  }

  // 五个角色示例
  const characters = ref([
    { name: 'A', color: '#EFFEEA' },
    { name: 'B', color: '#FFE9F2' },
    { name: 'C', color: '#ECECE7' },
    { name: 'D', color: '#FFF7DC' },
    { name: 'E', color: '#ECE5FF' },
  ])

  // 点击“返回” → 切回 Goal（Fun3）面板
  function goBack() {
    emit('openpanel', 'Fun3')
  }

  // 点击角色 → 发 select 事件
  function select(c) {
    emit('select', c)
  }

  // 鼠标穿透
  const electronAPI = window?.electronAPI ?? null
  function disableClick() { electronAPI?.setIgnoreMouseEvents(false) }
  function enableClick() { electronAPI?.setIgnoreMouseEvents(true) }
  onMounted(() => { electronAPI?.setIgnoreMouseEvents(false) })
  onBeforeUnmount(() => { electronAPI?.setIgnoreMouseEvents(true) })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  .char-selection {
    position: fixed;
    width: 600px;
    height: 380px;
    background: #FFEEDD;
    font-family: 'Press Start 2P', monospace;
    user-select: none;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 36px;
    padding: 0 12px;
    background: #FFD7BA;
    cursor: move;
  }
  .title {
    font-size: 14px;
  }
  .return-btn {
    background: #C8F0FF;
    border: none;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
  }
  .return-btn:hover {
    filter: brightness(1.1);
  }

  .panels {
    display: flex;
    height: calc(100% - 36px);
  }
  .panel {
    flex: 1;
    margin: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform .2s;
    cursor: pointer;
  }
  .panel:hover {
    transform: scale(1.05);
  }

  /* 更矮更宽的蓝色标签 */
  .label {
    background: #C8F0FF;
    padding: 2px 40px;
    font-size: 12px;
  }
</style>

  
  
  
  
  
  

<template>
  <div
    ref="wrapperRef"
    class="event-form"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="startDrag"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <h2>{{ event.id ? 'Edit event' : 'Add event' }}</h2>
    <form @submit.prevent="saveEvent">
      <div>
        <label for="title">Title</label>
        <input type="text" id="title" v-model="form.title" required />
      </div>
      <div>
        <label for="date">Date</label>
        <input type="date" id="date" v-model="form.date" required />
      </div>
      <div>
        <label for="time">Time</label>
        <input type="time" id="time" v-model="form.time" />
      </div>
      <div>
        <label for="description">Description</label>
        <textarea id="description" v-model="form.description"></textarea>
      </div>
      <div>
        <label for="tag">Label</label>
        <select id="tag" v-model="form.tag">
          <option value="Entertainment">Entertainment</option>
          <option value="Study">Study</option>
          <option value="Life">Life</option>
        </select>
      </div>
      <button type="submit" class="save-btn">{{ event.id ? 'Update' : 'Save' }}</button>
    </form>
    <button class="cancel-btn pixel-frame" @click="$emit('close')" title="Cancel">×</button>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
const props = defineProps({
  event: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['add-event', 'update-event', 'close'])

const form = reactive({
  id: props.event.id || null,
  title: props.event.title || '',
  date: props.event.date || '',
  time: props.event.time || '',
  description: props.event.description || '',
  tag: props.event.tag || 'Entertainment'
})

watch(() => props.event, val => Object.assign(form, val), { deep: true })

function saveEvent() {
  if (form.id) emit('update-event', { ...form })
  else emit('add-event', { ...form })
}

// 拖拽&穿透
const wrapperRef = ref(null)
const panelW = ref(0), panelH = ref(0)
const posX = ref(0), posY = ref(0)
let dragging = false, offX = 0, offY = 0
onMounted(async () => {
  await nextTick()
  panelW.value = wrapperRef.value.offsetWidth
  panelH.value = wrapperRef.value.offsetHeight
  posX.value = (window.innerWidth - panelW.value) / 2
  posY.value = (window.innerHeight - panelH.value) / 2
})
function startDrag(e) {
  if (e.target.classList.contains('cancel-btn')) return
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
// 穿透
const electronAPI = window?.electronAPI ?? null
function disableClick() { electronAPI?.setIgnoreMouseEvents(false) }
function enableClick()  { electronAPI?.setIgnoreMouseEvents(true) }
onBeforeUnmount(() => enableClick())
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.event-form {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  background: linear-gradient(145deg, #ffe5d9, #fad0c4);
  border: 4px solid #000;
  border-radius: 10px;
  box-shadow: 10px 10px 0 #000;
  font-family: 'Press Start 2P', monospace;
  position: relative; /* 使 cancel-btn 绝对定位 */
}

input,
textarea,
select,
button {
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border-radius: 6px;
  font-family: inherit;
}

button {
  background-color: #fae1dd;
  color: black;
  border: 3px solid #000;
  cursor: pointer;
  transition: filter 0.2s;
}

button:hover {
  filter: brightness(1.25);
}

/* 取消按钮（×）的样式 */
.cancel-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 28px;
  background: none;
  border: none;
  color: #f44336; /* 红色 */
  cursor: pointer;
  padding: 0; /* 去除按钮内的 padding */
  width: 32px; /* 设置按钮宽度 */
  height: 32px; /* 设置按钮高度 */
  text-align: center;
  line-height: 32px; /* 使×字符居中 */
}

.cancel-btn:hover {
  color: #d32f2f; /* 深红色 */
}

/* Select框和按钮的其他样式 */
select {
  background: #fae1dd;
  border: 3px solid #000;
}

select:hover {
  filter: brightness(1.1);
}
</style>

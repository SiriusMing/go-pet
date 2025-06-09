<template>
  <div
    ref="wrapperRef"
    class="memo"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="startDrag"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <h2>Memo - {{ date }}</h2>
    <div>
      <div v-if="todayEvents.length === 0">No event today.</div>
      <ul v-else>
        <li v-for="event in todayEvents" :key="event.id">
          <strong>{{ event.title }}</strong> - {{ event.time }}
          <p>{{ event.description }}</p>
          <span>{{ event.tag }}</span>
          <div>
            <button class="edit-btn" @click="onEdit(event)">Edit</button>
            <button class="delete-btn" @click="onDelete(event.id)">Delete</button>
          </div>
        </li>
      </ul>
    </div>
    <button class="add-btn" @click="onAdd">Add events</button>
    <button class="back-btn" @click="$emit('close')">Back to Calendar</button>
    <button class="close-btn pixel-frame" @click.stop="$emit('close')" title="Close">✕</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
const props = defineProps({
  date: String,
  events: Array
})
const emit = defineEmits(['close', 'openpanel', 'add-event', 'update-event', 'delete-event'])

const todayEvents = computed(() =>
  props.events.filter(e => e.date === props.date)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
)

function onAdd() {
  emit('openpanel', { type: 'EventFormPanel', event: { date: props.date } })
}
function onEdit(event) {
  emit('openpanel', { type: 'EventFormPanel', event })
}
function onDelete(id) {
  emit('delete-event', id)
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


/* 关闭按钮样式 */
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ffe5d9;
  border: 2px solid #000;
  border-radius: 8px;
  font-size: 22px;
  width: 34px;
  height: 34px;
  line-height: 30px;
  box-shadow: 2px 2px 0 #222;
  cursor: pointer;
  user-select: none;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, box-shadow 0.15s;
}
.close-btn:hover {
  background: #fcd5ce;
  box-shadow: 4px 4px 0 #222;
}
.pixel-frame {
  border: 2px solid #000;
  box-shadow: 2px 2px 0 #000, 0 0 0 #000;
  border-radius: 8px;
}

.memo {
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  background: linear-gradient(145deg, #ffe5d9, #fad0c4);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 10px 10px 0 #000;
  margin: 20px auto;
  max-width: 600px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 15px;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 4px 4px 0 #000, -2px -2px 0 #000 inset;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: filter 0.2s;
  font-family: 'Press Start 2P', monospace;
}

.add-btn {
  background-color: #fae1dd;
  color: #000;
  margin: 15px 0;
}

.add-btn:hover {
  filter: brightness(1.1);
}

.edit-btn {
  background-color: #ffd7ba;
  color: #000;
}

.edit-btn:hover {
  filter: brightness(1.1);
}

.delete-btn {
  background-color: #fcd5ce;
  color: #000;
}

.delete-btn:hover {
  filter: brightness(1.1);
}

.back-btn {
  background-color: #f9f9f9;
  color: #000;
  margin-top: 15px;
}

button:hover {
  filter: brightness(1.2);
}

h2 {
  font-size: 24px;
  color: #555;
}

span {
  display: block;
  margin-top: 5px;
  color: #888;
}

button:last-child {
  background-color: #f9f9f9;
  margin-top: 20px;
}
</style>

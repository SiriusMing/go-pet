<template>
  <div
    v-if="visible"
    ref="wrapperRef"
    class="calendar"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="startDrag"
    @mouseenter="disableClick"
    @mouseleave="enableClick"
  >
    <!-- 关闭按钮 -->
    <div class="close-btn pixel-frame" @click.stop="closeCalendar">✕</div>

    <h2>Calendar</h2>
    <!-- 显示当前月份和年份 -->
    <div class="calendar-header">
      <button @click="changeMonth(-1)">&lt;</button>
      <span>{{ currentDate.getFullYear() }} Year {{ currentDate.getMonth() + 1 }} Month</span>
      <button @click="changeMonth(1)">&gt;</button>
    </div>

    <!-- 星期栏 -->
    <div class="weekdays">
      <span>Sun</span>
      <span>Mon</span>
      <span>Tue</span>
      <span>Wed</span>
      <span>Thu</span>
      <span>Fri</span>
      <span>Sat</span>
    </div>

    <div class="calendar-grid">
      <div
        v-for="(day, index) in paddedDays"
        :key="index"
        :class="['calendar-day', { today: isToday(day), selected: isSelected(day) }]"
        @click="goToMemo(day)"
      >
        {{ day }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
const emit = defineEmits(['openpanel', 'close'])


const visible = ref(true) // 控制显示/关闭

const today = new Date()
const currentDate = ref(new Date())
const daysInMonth = ref([])
const paddedDays = ref([])
const selectedDay = ref(null)
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)

// 拖拽相关
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
  generateCalendar()
})
function startDrag(e) {
  // 只允许点击非关闭按钮区域拖动
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
  posX.value = Math.min(Math.max(e.clientX - offX, 0), window.innerWidth - w -170)
  posY.value = Math.min(Math.max(e.clientY - offY, -30), window.innerHeight - h - 320)
}
function endDrag() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
}

// 鼠标穿透相关
const electronAPI = window?.electronAPI ?? null
function disableClick() { electronAPI?.setIgnoreMouseEvents(false) }
function enableClick()  { electronAPI?.setIgnoreMouseEvents(true) }
onBeforeUnmount(() => enableClick())

// 日历功能
function generateCalendar() {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const totalDays = lastDay.getDate()
  const firstDayOfWeek = firstDay.getDay()

  daysInMonth.value = []
  for (let i = 1; i <= totalDays; i++) {
    daysInMonth.value.push(i)
  }

  paddedDays.value = Array(firstDayOfWeek).fill(null).concat(daysInMonth.value)
}

function goToMemo(day) {
  if (day) {
    selectedDay.value = day
    const selectedDate = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    // 不再用 router！而是 emit
    emit('openpanel', { type: 'MemoPanel', date: selectedDate })
  }
}

function changeMonth(direction) {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + direction)
  currentDate.value = newDate
  currentYear.value = newDate.getFullYear()
  currentMonth.value = newDate.getMonth() + 1
  generateCalendar()
}
function isToday(day) {
  const d = new Date()
  return d.getDate() === day &&
    d.getMonth() === currentDate.value.getMonth() &&
    d.getFullYear() === currentDate.value.getFullYear()
}
function isSelected(day) {
  return selectedDay.value === day
}

// 关闭按钮
function closeCalendar() {
  visible.value = false
}
</script>

<style scoped>
.calendar {
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  background: linear-gradient(145deg, #ffe5d9, #fad0c4);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 10px 10px 0 #000;
  margin: 20px auto;
  max-width: 600px;
  position: fixed;
  z-index: 20;
  transition: box-shadow 0.15s;
}

/* 右上角关闭按钮 */
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
  z-index: 30;
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

/* 其余 calendar 样式保持不变 */
.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}
.calendar-header button {
  font-size: 20px;
  padding: 10px;
  background-color: #fae1dd;
  border: none;
  cursor: pointer;
  border-radius: 6px;
}
.calendar-header button:hover {
  background-color: #ffeb3b;
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
  background-color: #ffe5d9;
}
.weekdays span {
  font-weight: bold;
  color: #5f6368;
  padding: 5px 0;
  text-align: center;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}
.calendar-day {
  padding: 20px;
  background-color: #fae1dd;
  cursor: pointer;
  border-radius: 6px;
  text-align: center;
  transition: background-color 0.2s;
}
.calendar-day:hover {
  background-color: #ffeb3b;
}
.calendar-day:nth-child(odd) {
  background-color: #ffe5d9;
}
.calendar-day.today {
  background-color: #ffd7ba;
  font-weight: bold;
}
.calendar-day.selected {
  background-color: #fcd5ce;
  border: 2px solid #000;
}
.calendar-day.selected:hover {
  background-color: #f9f9f9;
}
</style>


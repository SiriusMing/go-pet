<template>
  <div 
    class="mood-tracker" 
    ref="wrapperRef"
    @mouseenter="disableClick" 
    @mouseleave="enableClick"
    @mousedown="startDrag"
    :style="{ left: posX + 'px', top: posY + 'px' }"
  >
    <!-- 关闭按钮 -->
    <div class="close-btn pixel-frame" @click.stop="closePage">✕</div>

    <!-- 日期导航 -->
    <div class="date-nav">
      <div class="nav-left">
        <button class="nav-btn prev-btn" @click="prevDay">◄</button>
        <div class="current-date">{{ currentDate }}</div>
        <button class="nav-btn next-btn" @click="nextDay">►</button>
      </div>
      <button class="stats-btn" @click="goToStats" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">Statistics</button>
    </div>

    <!-- 心情选择区 -->
    <div class="mood-section">
      <h3>Today's mood</h3>
      <div class="mood-grid">
        <div 
          v-for="mood in moods" 
          :key="mood.value" 
          class="mood-item"
          :class="{ 'selected': selectedMood === mood.value }"
          @click="selectMood(mood.value)"
        >
          <div class="emoji">{{ mood.emoji }}</div>
          <div class="mood-label">{{ mood.label }}</div>
        </div>
      </div>
    </div>

    <!-- 心情小记 -->
    <div class="note-section">
      <h3>Today's mood note</h3>
      <textarea 
        v-model="moodNote" 
        placeholder="Write down today's mood..."
        rows="5"
      ></textarea>
    </div>

    <!-- 保存按钮 -->
    <button class="save-btn" @click="saveMood">Save</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';


const emit = defineEmits(['openpanel']);  // Emit 事件，用于通知父组件切换面板

// 心情选项数据
const moods = [
  { emoji: '😊', label: 'happy', value: 'happy' },
  { emoji: '🎉', label: 'excited', value: 'excited' },
  { emoji: '😌', label: 'calm', value: 'calm' },
  { emoji: '😪', label: 'tired', value: 'tired' },
  { emoji: '🥺', label: 'sad', value: 'sad' },
  { emoji: '😠', label: 'angry', value: 'angry' }
];

// 状态变量
const selectedMood = ref('');
const moodNote = ref('');
const currentDateObj = ref(new Date());
const moodHistory = ref({});

// 计算当前日期的格式化字符串
const currentDate = computed(() => {
  const date = currentDateObj.value;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const year = date.getFullYear();
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day}, ${year}`;
});

// 计算当前日期的唯一标识符（用于存储）
const dateKey = computed(() => {
  const date = currentDateObj.value;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
});

// 页面加载时从localStorage获取历史记录
onMounted(() => {
  const savedHistory = localStorage.getItem('moodHistory');
  if (savedHistory) {
    moodHistory.value = JSON.parse(savedHistory);
    loadMoodForCurrentDate();
  }
});

// 加载当前日期的心情记录
function loadMoodForCurrentDate() {
  const key = dateKey.value;
  if (moodHistory.value[key]) {
    selectedMood.value = moodHistory.value[key].mood;
    moodNote.value = moodHistory.value[key].note || '';
  } else {
    selectedMood.value = '';
    moodNote.value = '';
  }
}

// 选择心情
function selectMood(mood) {
  selectedMood.value = mood;
}

// 导航到前一天
function prevDay() {
  const date = new Date(currentDateObj.value);
  date.setDate(date.getDate() - 1);
  currentDateObj.value = date;
  loadMoodForCurrentDate();
}

// 导航到后一天
function nextDay() {
  const date = new Date(currentDateObj.value);
  date.setDate(date.getDate() + 1);
  currentDateObj.value = date;
  loadMoodForCurrentDate();
}

// 保存心情记录
function saveMood() {
  if (!selectedMood.value) return;
  
  const key = dateKey.value;
  moodHistory.value[key] = {
    mood: selectedMood.value,
    note: moodNote.value,
    date: currentDate.value
  };
  
  // 保存到localStorage
  localStorage.setItem('moodHistory', JSON.stringify(moodHistory.value));
}

// 跳转到统计页面
function goToStats() {
  // 使用 emit 通知父组件切换到统计面板
  emit('openpanel', { type: 'stats' });
}

// 鼠标穿透控制
const electronAPI = window?.electronAPI ?? null;

function disableClick() { 
  electronAPI?.setIgnoreMouseEvents(false); 
}

function enableClick()  { 
  electronAPI?.setIgnoreMouseEvents(true);  
}

onBeforeUnmount(() => enableClick()); // 组件卸载时恢复鼠标事件

const wrapperRef = ref(null);
const panelW = ref(0), panelH = ref(0);
const posX = ref(0), posY = ref(250);  // 初始位置下移250px

let dragging = false, offX = 0, offY = 0;

// 初始化面板位置
onMounted(() => {
  panelW.value = wrapperRef.value.offsetWidth;
  panelH.value = wrapperRef.value.offsetHeight;

  // 计算屏幕中心位置 + 下移 250px
  posX.value = (window.innerWidth - panelW.value) / 2;
  posY.value = (window.innerHeight - panelH.value) / 2 + 50;  // 初始下移250px
});

// 开始拖动
function startDrag(e) {
  dragging = true;

  // 计算鼠标点击相对面板的偏移量
  offX = e.clientX - posX.value;
  offY = e.clientY - posY.value;

  // 监听鼠标移动和鼠标松开事件
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);
}

// 拖动面板
function onDrag(e) {
  if (!dragging) return;

  // 计算新的 X 和 Y 坐标，确保面板不会超出屏幕
  posX.value = e.clientX - offX;  // 水平限制，保持相对初始位置的偏移
  posY.value = e.clientY - offY;  // 垂直限制，保持相对初始位置的偏移

  // 确保面板位置不会超出屏幕边界
  posX.value = Math.min(Math.max(posX.value, 0), window.innerWidth - panelW.value);  // 水平限制
  posY.value = Math.min(Math.max(posY.value, 0), window.innerHeight - panelH.value); // 垂直限制
}

// 结束拖动
function endDrag() {
  dragging = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', endDrag);
}

// 关闭面板
// 修改closePage函数以触发关闭事件
function closePage() {
  emit('close');
}
</script>

<style scoped>
.mood-tracker {
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #FFE4E1;
  border: 4px solid black;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: fixed;
  cursor: move;
  transition: width 0.3s ease;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #ff706b;
  background-color: #f9b4b4;
  border: 2px solid #000000;
  border-radius: 50%;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.close-btn:hover {
  background-color: #c9302c;
  color: white;
  border-color: #000000;
}

/* 日期导航 */
.date-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #FFD1DC;
  border-bottom: 4px solid black;
}

.nav-left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.current-date {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  flex: 1;
}

.nav-btn {
  width: 40px;
  height: 30px;
  background: #FFD1DC;
  border: 2px solid black;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
}

.nav-btn:hover {
  background: #FFC0CB;
}

.stats-btn {
  background: #FFD1DC;
  border: 2px solid black;
  border-radius: 4px;
  padding: 5px 10px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 30px;
  margin-right: 60px;
}

.stats-btn:hover {
  background: #FFC0CB;
}

/* 心情选择区 */
.mood-section {
  padding: 15px;
  border-bottom: 4px solid black;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
}

.mood-item {
  background-color: #FFE4E1;
  border: 3px solid black;
  border-radius: 4px;
  padding: 15px 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.2s ease;
}

.mood-item:hover {
  background-color: #FFC0CB;
}

.mood-item.selected {
  background-color: #FFC0CB;
  transform: scale(0.95);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

.emoji {
  font-size: 24px;
  margin-bottom: 5px;
}

.mood-label {
  font-size: 14px;
}

/* 心情小记 */
.note-section {
  padding: 15px;
  border-bottom: 4px solid black;
}

textarea {
  width: 100%;
  background-color: #FFE4E1;
  border: 3px solid black;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Microsoft YaHei', sans-serif;
  resize: none;
}

/* 保存按钮 */
.save-btn {
  display: block;
  width: 100%;
  padding: 15px;
  background-color: #FFE4E1;
  border: none;
  border-top: 4px solid black;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.save-btn:hover {
  background-color: #FFC0CB;
}
</style>




<template>
  <div 
    class="mood-stats" 
    ref="wrapperRef"
    @mouseenter="disableClick" 
    @mouseleave="enableClick"
    @mousedown="startDrag"
    :style="{ left: posX + 'px', top: posY + 'px' }"
  >
    <div class="stats-header">

      <button class="back-btn" @click="goBackfun2">Return</button>
    </div>

    <div class="stats-container">
      <!-- 数据总览 -->
      <div class="stats-card">
        <h2>Emotional Overview</h2>
        <div class="stats-overview">
          <div v-for="(count, mood) in moodStats" :key="mood" class="stat-item">
            <div class="emoji">{{ getMoodEmoji(mood) }}</div>
            <div class="count">{{ count }} times</div>
            <div class="label">{{ getMoodLabel(mood) }}</div>
          </div>
        </div>
      </div>

      <!-- 最近情绪变化 -->
      <div class="stats-card">
        <h2>Recent 30 Days Mood Changes</h2>
        <div class="mood-chart">
          <div v-for="day in recentMoodHistory" :key="day.date" 
               class="chart-day" :title="`${day.date}: ${getMoodLabel(day.mood)}`">
            <div class="day-mood" :style="{backgroundColor: getMoodColor(day.mood)}"></div>
            <div class="day-label">{{ day.date }}</div>
          </div>
        </div>
      </div>

      <!-- 情绪分布饼图 -->
      <div class="stats-card">
        <h2>Emotional Distribution</h2>
        <div class="pie-chart">
          <div class="pie-container">
            <div class="pie" :style="pieChartStyle"></div>
          </div>
          <div class="pie-legend">
            <div v-for="(item, index) in pieChartData" :key="index" class="legend-item">
              <div class="color-box" :style="{ backgroundColor: item.color }"></div>
              <div>{{ item.label }}: {{ item.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
const emit = defineEmits(['openpanel']); 

// 心情选项数据
const moods = [
  { emoji: '😊', label: 'happy', value: 'happy' },
  { emoji: '🎉', label: 'excited', value: 'excited' },
  { emoji: '😌', label: 'calm', value: 'calm' },
  { emoji: '😪', label: 'tired', value: 'tired' },
  { emoji: '🥺', label: 'sad', value: 'sad' },
  { emoji: '😠', label: 'angry', value: 'angry' }
];

// 心情颜色映射
const moodColors = {
  'happy': '#FFC107',
  'excited': '#FF4081',
  'calm': '#4CAF50',
  'tired': '#9E9E9E', 
  'sad': '#2196F3',
  'angry': '#F44336'
};

// 状态变量
const moodHistory = ref({});

// 获取所有情绪记录
onMounted(() => {
  const savedHistory = localStorage.getItem('moodHistory');
  if (savedHistory) {
    moodHistory.value = JSON.parse(savedHistory);
  }
});

// 计算心情统计数据
const moodStats = computed(() => {
  const stats = {};
  Object.values(moodHistory.value).forEach(record => {
    if (record.mood) {
      if (!stats[record.mood]) {
        stats[record.mood] = 0;
      }
      stats[record.mood]++;
    }
  });
  return stats;
});

// 计算最近30天的心情记录
const recentMoodHistory = computed(() => {
  const records = [];
  const today = new Date();
  
  // 获取最近30天的日期
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    
    if (moodHistory.value[key]) {
      records.push({
        date: formattedDate,
        mood: moodHistory.value[key].mood
      });
    } else {
      records.push({
        date: formattedDate,
        mood: null
      });
    }
  }
  
  return records;
});

// 计算饼图数据
const pieChartData = computed(() => {
  const total = Object.values(moodStats.value).reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];
  
  return Object.entries(moodStats.value).map(([mood, count]) => {
    return {
      mood,
      label: getMoodLabel(mood),
      color: moodColors[mood] || '#EEEEEE',
      count,
      percentage: Math.round((count / total) * 100)
    };
  });
});

// 生成饼图CSS样式
const pieChartStyle = computed(() => {
  if (pieChartData.value.length === 0) return {};
  
  let gradientString = 'conic-gradient(';
  let startAngle = 0;
  
  pieChartData.value.forEach(slice => {
    const angle = (slice.count / Object.values(moodStats.value).reduce((sum, count) => sum + count, 0)) * 100;
    gradientString += `${slice.color} ${startAngle}% ${startAngle + angle}%, `;
    startAngle += angle;
  });
  
  gradientString = gradientString.slice(0, -2) + ')';
  return { background: gradientString };
});

// 获取心情的表情符号
function getMoodEmoji(moodValue) {
  const mood = moods.find(m => m.value === moodValue);
  return mood ? mood.emoji : '❓';
}

// 获取心情的文字标签
function getMoodLabel(moodValue) {
  const mood = moods.find(m => m.value === moodValue);
  return mood ? mood.label : '未知';
}

// 获取心情对应的颜色
function getMoodColor(moodValue) {
  return moodColors[moodValue] || '#EEEEEE';
}

// 返回上一页
function goBackfun2() {
  // 使用 emit 通知父组件切换到心情面板
  emit('openpanel', { type: 'Fun2' });  // 这里 'Fun2' 对应你的 mood 面板
}



// Drag functionality
const wrapperRef = ref(null);
const posX = ref(0), posY = ref(250);
const panelW = ref(0), panelH = ref(0);
let dragging = false, offX = 0, offY = 0;

onMounted(() => {
  panelW.value = wrapperRef.value.offsetWidth;
  panelH.value = wrapperRef.value.offsetHeight;
  
  // 设置初始位置为屏幕中心并稍微偏移
  posX.value = (window.innerWidth - panelW.value) / 2;
  posY.value = (window.innerHeight - panelH.value) / 2 + 100; 
});

function startDrag(e) {
  dragging = true;
  offX = e.clientX - posX.value;
  offY = e.clientY - posY.value;
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);
}

function onDrag(e) {
  if (!dragging) return;

  // 计算面板的新位置
  posX.value = e.clientX - offX;
  posY.value = e.clientY - offY;

  // 增加拖动区域的范围，使面板能够拖拽到屏幕外
  // 这里减去一个偏移量（比如100px）让它能稍微超出屏幕边界
  posX.value = Math.min(Math.max(posX.value,-180), window.innerWidth -600  );  // 宽度限制，允许面板超出屏幕100px
  posY.value = Math.min(Math.max(posY.value, -50), window.innerHeight - 500); // 高度限制，允许面板超出屏幕100px
}

function endDrag() {
  dragging = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', endDrag);
}


// Mouse penetration control
const electronAPI = window?.electronAPI ?? null;

function disableClick() { 
  electronAPI?.setIgnoreMouseEvents(false); 
}

function enableClick()  { 
  electronAPI?.setIgnoreMouseEvents(true);  
}

onBeforeUnmount(() => enableClick()); 
</script>

<style scoped>

.mood-stats {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
  position: relative;

  /* 等比例缩小一半 */
  transform: scale(0.5);
  transform-origin: top left; /* 确保从左上角开始缩放 */
}

/* Drag functionality styles */
.mood-stats {
  cursor: move;
  position: absolute;
  top: 50px;
  left: 50px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background-color: #FFD1DC;
  border: 3px solid black;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
}

.back-btn:hover {
  background-color: #FFC0CB;
}

/* Chart styles */
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background-color: #FFE4E1;
  border: 4px solid black;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stats-card h2 {
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  border-bottom: 2px solid #FFD1DC;
  padding-bottom: 10px;
}

/* Emoji overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  border: 2px solid black;
  border-radius: 8px;
  background-color: white;
}

.stat-item .emoji {
  font-size: 30px;
  margin-bottom: 10px;
}

.stat-item .count {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

/* Recent mood changes */
.mood-chart {
  display: flex;
  height: 100px;
  gap: 3px;
}

.chart-day {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.day-mood {
  flex-grow: 1;
  border-radius: 4px 4px 0 0;
  background-color: #EEEEEE;
}

.day-label {
  font-size: 10px;
  text-align: center;
  padding: 3px 0;
  white-space: nowrap;
  overflow: hidden;
}

/* Pie chart styles */
.pie-chart {
  display: flex;
  gap: 20px;
  align-items: center;
}

.pie-container {
  width: 200px;
  height: 200px;
}

.pie {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 0 3px black;
}

.pie-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.color-box {
  width: 15px;
  height: 15px;
  margin-right: 8px;
  border: 1px solid black;
}


</style>

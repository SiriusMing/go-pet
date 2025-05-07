<template>
  <div class="calendar">
    <h2>Calendar</h2>
    <!-- 显示当前月份和年份 -->
    <div class="calendar-header">
      <button @click="changeMonth(-1)">&lt;</button> <!-- 上一月 -->
      <span>{{ currentDate.getFullYear() }}Year {{ currentDate.getMonth() + 1 }}Month</span>
      <button @click="changeMonth(1)">&gt;</button> <!-- 下一月 -->
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

<script>
export default {
  data() {
    return {
      currentDate: new Date(),
      daysInMonth: [],
      paddedDays: [],  // 用于存储处理过的日历天数
      selectedDay: null, // 用于存储当前选中的日期
    };
  },
  mounted() {
    this.generateCalendar();
  },
  methods: {
    // 生成当前月的日历
    generateCalendar() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);  // 当前月的第一天
      const lastDay = new Date(year, month + 1, 0);  // 当前月的最后一天
      const totalDays = lastDay.getDate();  // 当前月的总天数
      const firstDayOfWeek = firstDay.getDay();  // 第一天下来的星期几（0: Sunday, 1: Monday...）

      this.daysInMonth = [];
      for (let i = 1; i <= totalDays; i++) {
        this.daysInMonth.push(i);  // 将每一天添加到数组
      }

      // 将第一天之前的空白格子填充进去（确保从正确的位置开始显示）
      this.paddedDays = Array(firstDayOfWeek).fill(null).concat(this.daysInMonth);
    },
    // 跳转到某天的备忘录页面
    goToMemo(day) {
      if (day) {
        this.selectedDay = day;
        this.$router.push({ name: 'memo', params: { date: day } });
      }
    },
    // 修改月份（-1表示上一月，1表示下一月）
    changeMonth(direction) {
      const newDate = new Date(this.currentDate);
      newDate.setMonth(newDate.getMonth() + direction);  // 修改月份
      this.currentDate = newDate;  // 更新 currentDate
      this.generateCalendar();  // 重新生成日历
    },
    // 判断是否为今天
    isToday(day) {
      const today = new Date();
      return today.getDate() === day && today.getMonth() === this.currentDate.getMonth() && today.getFullYear() === this.currentDate.getFullYear();
    },
    // 判断是否为当前选中的日期
    isSelected(day) {
      return this.selectedDay === day;
    }
  }
};
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
}

.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header button {
  font-size: 20px;
  padding: 10px;
  background-color: #fae1dd; /* 浅粉色 */
  border: none;
  cursor: pointer;
  border-radius: 6px;
}

.calendar-header button:hover {
  background-color: #ffeb3b; /* 浅黄色 */
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
  background-color: #ffe5d9; /* 浅橙粉色 */
}

.weekdays span {
  font-weight: bold;
  color: #5f6368; /* 深灰色，用于星期几的文字 */
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
  background-color: #fae1dd; /* 浅粉色 */
  cursor: pointer;
  border-radius: 6px;
  text-align: center;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background-color: #ffeb3b; /* 浅黄色 */
}

.calendar-day:nth-child(odd) {
  background-color: #ffe5d9; /* 浅橙粉色 */
}

.calendar-day.today {
  background-color: #ffd7ba; /* 浅黄色 */
  font-weight: bold;
}

.calendar-day.selected {
  background-color: #fcd5ce; /* 淡粉色 */
  border: 2px solid #000;
}

.calendar-day.selected:hover {
  background-color: #f9f9f9;
}
</style>

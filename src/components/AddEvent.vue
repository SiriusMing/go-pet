<template>
  <div class="event-form">
    <h2>{{ event.id ? 'Edit event' : 'Add event' }}</h2>
    <form @submit.prevent="saveEvent">
      <div>
        <label for="title">Title</label>
        <input type="text" id="title" v-model="event.title" required />
      </div>

      <div>
        <label for="date">Date</label>
        <input type="date" id="date" v-model="event.date" required />
      </div>

      <div>
        <label for="time">Time</label>
        <input type="time" id="time" v-model="event.time" />
      </div>

      <div>
        <label for="description">Description</label>
        <textarea id="description" v-model="event.description"></textarea>
      </div>

      <div>
        <label for="tag">Label</label>
        <select id="tag" v-model="event.tag">
          <option value="Entertainment">Entertainment</option>
          <option value="Study">Study</option>
          <option value="Life">Life</option>
        </select>
      </div>

      <button type="submit">{{ event.id ? 'Update' : 'Save' }}</button>
    </form>

    <button class="cancel-btn" @click="goBackToMemo" title="Cancel">×</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      event: {
        id: this.$route.params.eventId || null,  // 从路由获取事件 ID
        title: '',
        date: '',
        time: '',
        description: '',
        tag: ''
      }
    };
  },

  created() {
    if (this.event.id) {
      // console.log("Edit the event");
      const numericId = Number(this.event.id); // 将字符串转为数字
      const existingEvent = this.$store.state.events.find(event => event.id === numericId);
      if (existingEvent) {
        // console.log("Pad the page");
        this.event = { ...existingEvent };
      } else {
        console.warn("Event not found:", numericId);
      }
    }
  },

  watch: {
    // 监听事件日期的变化，确保取消跳转时能够带入正确日期
    'event.date'(newDate) {
      if (newDate) {
        this.event.date = newDate;
      }
    }
  },

  methods: {
    // 保存新事件或更新已有事件
    saveEvent() {
      if (this.event.id) {
        // 更新已有事件
        this.$store.dispatch('updateEvent', this.event);
      } else {
        // 保存新事件
        this.event.id = Date.now();  // 生成唯一 ID
        this.$store.dispatch('saveEvent', this.event);
      }
      // 跳转到备忘录页面，并传递事件日期
      this.$router.push({ name: 'memo', params: { date: this.event.date } });
    },

    // 取消操作返回备忘录页面
    goBackToMemo() {
      // 优先使用路由传进来的日期参数，如果没有则使用事件中的日期
      const date = this.event.date || this.$route.params.date || new Date().toISOString().split('T')[0];
      this.$router.push({ name: 'memo', params: { date } });
    }
  }
};

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

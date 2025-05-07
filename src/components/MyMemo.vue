<template>
  <div class="memo">
    <h2>Memo - {{ selectedDate }}</h2>
    <div v-if="events.length === 0">No event today.</div>
    <ul v-else>
      <li v-for="event in events" :key="event.id">
        <strong>{{ event.title }}</strong> - {{ event.time }}
        <p>{{ event.description }}</p>
        <span>{{ event.tag }}</span>
        <div>
          <button class="edit-btn" @click="editEvent(event)">Edit</button>
          <button class="delete-btn" @click="deleteEvent(event.id)">Delete</button>
        </div>
      </li>
    </ul>
    <button class="add-btn" @click="addEvent">Add events</button>
    <button class="back-btn" @click="goBackToCalendar">Back to Calendar</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedDate: this.$route.params.date,  // 初始从路由获取
    };
  },
  watch: {
    // 监视路由参数变化，确保日期变动时重新获取事件
    '$route.params.date'(newDate) {
      this.selectedDate = newDate;
    }
  },
  methods: {
    addEvent() {
      // 跳转到事件添加页面，并传递选中的日期
      this.$router.push({ name: 'addEvent', params: { date: this.selectedDate } });
    },
    goBackToCalendar() {
      this.$router.push({ name: 'calendar' });
    },
    editEvent(event) {
      // 跳转到事件编辑页面，并传递事件 ID
      this.$router.push({ name: 'addEvent', params: { eventId: event.id } });
    },
    async deleteEvent(eventId) {
      try {
        // 通过 Vuex 的 action 删除事件并确保更新
        await this.$store.dispatch('deleteEvent', eventId);
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  },
  computed: {
    events() {
      // 通过 Vuex 获取事件，并根据 selectedDate 过滤
      return this.$store.getters.getEventsByDate(this.selectedDate) || [];
    }
  }
};
</script>

<style scoped>
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
  background-color: #f9f9f9; /* 轻微的背景色 */
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
  background-color: #fae1dd; /* 浅粉色 */
  color: #000;
  margin: 15px 0;
}

.add-btn:hover {
  filter: brightness(1.1);
}

.edit-btn {
  background-color: #ffd7ba; /* 浅黄色 */
  color: #000;
}

.edit-btn:hover {
  filter: brightness(1.1);
}

.delete-btn {
  background-color: #fcd5ce; /* 淡粉色 */
  color: #000;
}

.delete-btn:hover {
  filter: brightness(1.1);
}

.back-btn {
  background-color: #f9f9f9; /* 轻微背景色 */
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

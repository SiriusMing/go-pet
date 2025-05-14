<template>
  <div class="memo">
    <h2>Memo - {{ selectedDate }}</h2>

    <div v-if="isLoaded">
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
    </div>
    <div v-else>
      <p>Loading events...</p>
    </div>

    <button class="add-btn" @click="addEvent">Add events</button>
    <button class="back-btn" @click="goBackToCalendar">Back to Calendar</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentDate: this.$route.params.date || new Date().toISOString().split('T')[0],
      isLoaded: false
    };
  },

  watch: {
    '$route.params.date'(newDate) {
      this.currentDate = newDate;
    },
    '$store.state.events': {
      handler() {
        // console.log('Vuex events changed.');
      },
      deep: true
    }
  },

  created() {
    // console.log('Created hook triggered');

    this.$store.dispatch('loadEvents')
      .then(() => {
        // console.log('Events loaded from localStorage'); 调试代码
        this.isLoaded = true;
      })
      .catch((error) => {
        console.error('Error loading events:', error);
        this.isLoaded = true; // 即使失败也不阻塞渲染
      });
  },

  computed: {
    selectedDate() {
      return this.currentDate;
    },
    events() {
      if (!this.isLoaded) return [];

      // const allEvents = this.$store.state.events;
      // console.log("All events in Vuex:", allEvents); 调试代码
      // console.log("Selected date is:", this.selectedDate) 调试代码

      const eventsForDate = this.$store.getters.getEventsByDate(this.selectedDate) || [];
      // console.log('Events for selected date:', eventsForDate); 调试代码
      return [...eventsForDate].sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
    }
  },

  methods: {
    addEvent() {
      this.$router.push({ name: 'addEvent', params: { date: this.selectedDate } });
    },
    goBackToCalendar() {
      this.$router.push({ name: 'calendar' });
    },
    editEvent(event) {
      this.$router.push({ name: 'addEvent', params: { eventId: event.id } });
    },
    async deleteEvent(eventId) {
      try {
        await this.$store.dispatch('deleteEvent', eventId);
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
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

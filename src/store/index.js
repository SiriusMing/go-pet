// src/store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      events: []  // 存储事件的数组
    };
  },
  mutations: {
    // 初始化事件（从 localStorage 读取）
    setEvents(state, events) {
      state.events = events;
    },
    // 保存新事件
    saveEvent(state, event) {
      state.events.push(event);
      localStorage.setItem('events', JSON.stringify(state.events)); // 保存到本地
    },
    // 更新已有事件
    updateEvent(state, updatedEvent) {
      const index = state.events.findIndex(event => event.id === updatedEvent.id);
      if (index !== -1) {
        state.events.splice(index, 1, updatedEvent);
        localStorage.setItem('events', JSON.stringify(state.events)); // 保存到本地
      }
    },
    // 删除事件
    deleteEvent(state, eventId) {
      state.events = state.events.filter(event => event.id !== eventId);
      localStorage.setItem('events', JSON.stringify(state.events)); // 保存到本地
    }
  },
  actions: {
    // 保存事件
    saveEvent({ commit }, event) {
      commit('saveEvent', event);
    },
    // 更新事件
    updateEvent({ commit }, updatedEvent) {
      commit('updateEvent', updatedEvent);
    },
    // 删除事件
    deleteEvent({ commit }, eventId) {
      commit('deleteEvent', eventId);
    },
    // 加载本地存储里的事件
    loadEvents({ commit }) {
      return new Promise((resolve, reject) => {
        const raw = localStorage.getItem('events');
        if (raw) {
          const events = JSON.parse(raw);
          commit('setEvents', events);
          resolve(events);
        } else {
          reject('No events found in localStorage');
        }
      });
    }
  },
  getters: {
    // 根据日期获取事件
    getEventsByDate: (state) => (date) => {
      return state.events.filter(event => event.date === date);
    },
    // 获取所有事件
    getAllEvents: (state) => {
      return state.events;
    }
  }
});

export default store;

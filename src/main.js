// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';  // 引入 Vuex store

const app = createApp(App);

store.dispatch('loadEvents');

app.use(router);  // 使用路由
app.use(store);   // 使用 Vuex store

app.mount('#app');

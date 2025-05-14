import { createRouter, createWebHistory } from 'vue-router';
import Calendar from '../components/MyCalendar.vue';
import Memo from '../components/MyMemo.vue';
import AddEvent from '../components/AddEvent.vue';

const routes = [
  {
    path: '/',
    name: 'calendar',
    component: Calendar  // 默认页面显示日历
  },
  {
    path: '/memo/:date',  // 动态路由，显示备忘录
    name: 'memo',
    component: Memo,
    props: true  // 将路由参数作为 props 传递给组件
  },
  {
    path: '/add-event/:date',  // 动态路由，显示添加事件页面
    name: 'addEvent',
    component: AddEvent,
    props: true
  },
  {
    path: '/add-event/:eventId?',  // eventId 可选，用于编辑事件
    name: 'addEvent',
    component: AddEvent
  }
];

// 创建并导出路由实例
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),  // 使用 HTML5 History 模式
  routes
});

export default router;

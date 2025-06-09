import { createRouter, createWebHashHistory } from 'vue-router'
import Main from '@renderer/views/mainpage/mainpage.vue'
import Login from '@renderer/views/login/login.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/mainpage', component: Main, exact: true },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router


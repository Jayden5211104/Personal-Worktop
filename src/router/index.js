import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: () => import('../views/PomodoroView.vue')
  },
  {
    path: '/music',
    name: 'Music',
    component: () => import('../views/MusicView.vue')
  },
  {
    path: '/words',
    name: 'Words',
    component: () => import('../views/WordView.vue')
  },
  {
    path: '/water',
    name: 'Water',
    component: () => import('../views/WaterView.vue')
  },
  {
    path: '/aichat',
    name: 'AiChat',
    component: () => import('../views/AiChatView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

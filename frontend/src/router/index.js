import { createRouter, createWebHistory } from 'vue-router'
import AllGrafanaComponents from '../views/AllGrafanaComponents.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: AllGrafanaComponents
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

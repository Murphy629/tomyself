import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../views/HomeView.vue')
const SignupView = () => import('../views/SignupView.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/signup', name: 'signup', component: SignupView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router

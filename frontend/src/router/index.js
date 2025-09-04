import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue' // adjust path if it's in /pages
import HomePage from '../views/HomePage.vue'

const routes = [
  {
    path: '/login',     // 👈 URL will be base-url/log-in
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/SignupPage.vue')
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: HomePage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Vite projects
  routes,
})


export default router
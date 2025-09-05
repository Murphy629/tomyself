import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import QueryBuilderPage from '../views/QueryBuilderPage.vue'

const routes = [
  {
    path: '/query-builder',
    name: 'QueryBuilder',
    component: QueryBuilderPage
  },
  {
    path: '/login',
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
  } // need to be modified
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Vite projects
  routes,
})


export default router
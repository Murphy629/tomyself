import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../views/HomeView.vue')
const SignupView = () => import('../views/SignupView.vue')
const LoginView = () => import('../views/LoginView.vue')
const InitializationView = () => import('../views/InitializationView.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/signup', name: 'signup', component: SignupView },
  { path: '/login', name: 'login', component: LoginView }, 
  { path: '/initialization', name: 'initialization', component: InitializationView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router

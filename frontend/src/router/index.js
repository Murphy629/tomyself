import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'

const routes = [
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
  }, // need to be modified
  {
    path: '/initialization',
    name: 'Initialization',
    component: () => import('../views/InitializationPage.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutPage.vue')
  },
  {
    path: '/organizer',
    name: 'Organizer',
    component: () => import('../views/OrganizerPage.vue')
  },
  {
    path: '/data-formula',
    name: 'DataFormula',
    component: () => import('../views/DataFormulaPage.vue')
  },
  {
    path: '/data-import',
    name: 'DataImport',
    component: () => import('../views/DataImportPage.vue')
  },
  {
    path: '/diagnostics',
    name: 'Diagnostics',
    component: () => import('../views/DiagnosisPage.vue')
  },
  {
    path: '/panel-editor',
    name: 'PanelEditor',
    component: () => import('../views/PanelEditor.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingPage.vue')
  },
  {
    path: '/admin-panel',
    name: 'AdminPanel',
    component: () => import('../views/AdminPanel.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Vite projects
  routes,
})


export default router
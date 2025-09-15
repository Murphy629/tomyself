import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import IntroPage from '../views/ IntroPage.vue'
import NotFoundPage from '../views/NotFoundPage.vue'

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
    component: NotFoundPage
  },
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
    name: 'PanelEditorPage',
    component: () => import('../views/PanelEditorPage.vue')
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
  },
  {
    path: '/intro',
    name: 'Intro',
    component: IntroPage
  },
  {
    path: '/panel/edit',
    name: 'EditExistingPanel',
    component: () => import('../views/Editor.vue')
  },
  // {
  //   path: '/panel/create',
  //   name: 'CreateNewPanel',
  //   component: () => import('../views/Creator.vue')
  // },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Vite projects
  routes,
})


export default router
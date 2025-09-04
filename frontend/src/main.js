import { createApp } from 'vue'
import App from './App.vue'
import router from './router'      // ✅ 新增
// 你原有的全局样式在此保持不变，例如 import './MainStyle.css'

createApp(App).use(router).mount('#app')  // ✅ 新增 .use(router)

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'      // ✅ New
// Your existing global styles remain unchanged here, for example import './MainStyle.css'

createApp(App).use(router).mount('#app')  // ✅ New .use(router)

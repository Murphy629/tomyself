import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PanelUI from './ui/panel-ui.js'   // 引入 PanelUI 插件

const app = createApp(App)
app.use(router)       // 保留 router
app.use(PanelUI)      // 保留 PanelUI
app.mount('#app')

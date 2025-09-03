import { createApp } from 'vue'
import './MainStyle.css'
import App from './App.vue'

// ✅ 关键：引入并安装插件（注意路径/文件名）
import PanelUI from './ui/panel-ui.js'

const app = createApp(App)
app.use(PanelUI)            // ✅ 必须有
app.mount('#app')

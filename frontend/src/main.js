import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PanelUI from './ui/panel-ui.js'

const app = createApp(App)
app.use(router)
app.use(PanelUI)
app.mount('#app')

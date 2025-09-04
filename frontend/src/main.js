// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'
// import PanelUI from './ui/panel-ui.js'
// import './MainStyle.css'

// const app = createApp(App)
// app.use(router)
// app.use(PanelUI)
// app.mount('#app')



import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './MainStyle.css'


const app = createApp(App)
app.use(router)
app.mount('#app')
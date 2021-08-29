import 'vuetify/lib/styles/main.css'
// import './main.scss'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify/lib/framework'

import App from './App.vue'

createApp(App).use(createVuetify()).mount('#app')

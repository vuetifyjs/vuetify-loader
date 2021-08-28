// import 'vuetify/lib/styles/main.sass'
import './main.scss'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify/lib/framework'
import * as components from 'vuetify/lib/components'
import * as directives from 'vuetify/lib/directives'

import App from './App.vue'

createApp(App).use(createVuetify({ components, directives})).mount('#app')

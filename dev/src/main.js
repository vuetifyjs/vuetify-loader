import 'vuetify/src/stylus/app.styl'
import Vue from 'vue'
import Vuetify from 'vuetify/lib/components/Vuetify'
import App from './App.vue'

Vue.use(Vuetify)

new Vue({
  el: '#app',
  render: h => h(App)
})

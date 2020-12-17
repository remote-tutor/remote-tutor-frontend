import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { Datetime } from 'vue-datetime';
import VueCountdownTimer from 'vuejs-countdown-timer'
// You need a specific loader for CSS files
import 'vue-datetime/dist/vue-datetime.css'
import draggable from 'vuedraggable'
import VuePlyr from 'vue-plyr'

Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('Datetime', Datetime);
Vue.use(VueCountdownTimer)
Vue.component('draggable', draggable)
Vue.use(VuePlyr, {emit: ['error', 'play']})
import './plugins/vee-validate';
import store from './store'

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')

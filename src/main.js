import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import './assets/css/global.css'
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')

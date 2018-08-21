import locale from 'element-ui/lib/locale/lang/en'
import Vue from 'vue'
import ElementUI from 'element-ui'
import App from './App.vue'
import VueForm from 'vue-form'
import router from './router'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-theme-chalk';
import tinymce from 'vue-tinymce-editor'

Vue.component('tinymce', tinymce)

import {
  setWalletStatus
} from '../utils/web3Service.js'

Vue.use(ElementUI, {locale})

Vue.config.productionTip = false
Vue.use(VueForm)

//Set wallet variables from web3 every second(if changed)
setInterval(function () {
  (async () => {
    setWalletStatus()
  })()
}, 1000);




new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
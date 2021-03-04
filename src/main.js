import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入css样式表
import './assets/css/global.css'
// 导入字体
import './assets/fonts/iconfont.css'
// 引入组件tabletree
import TreeTable from 'vue-table-with-tree-grid'
// 导入axios
import axios from 'axios'
// 配置axios根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
// 挂载到vue实例
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

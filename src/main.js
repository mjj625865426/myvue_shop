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
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
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
// 定义过滤器
Vue.filter('dateFormat', function (orginVal) {
  const dt = new Date(orginVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const s = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${s} ${hh}:${mm}:${ss}`
})
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

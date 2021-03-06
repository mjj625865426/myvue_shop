import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
// 导入user用户列表
import Users from '../components/user/Users.vue'
// 导入Rights
import Rights from '../components/power/Rights.vue'
// 导入roles
import Roles from '../components/power/Roles.vue'
// 导入Cate
import Cate from '../components/goods/Cate.vue'
// 导入params
import Params from '../components/goods/Params.vue'
// 导入List
import List from '../components/goods/List.vue'
// 导入Add
import Add from '../components/goods/Add.vue'
// 导入Order
import Order from '../components/order/Order.vue'
// 导入report
import Report from '../components/report/Report.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect: '/welcome', children: [{ path: '/welcome', component: Welcome }, { path: '/goods', component: List }, { path: '/roles', component: Roles }, { path: '/rights', component: Rights }, { path: '/users', component: Users }, { path: '/categories', component: Cate }, { path: '/params', component: Params }, { path: '/goods/add', component: Add }, { path: '/orders', component: Order }, { path: '/reports', component: Report }] }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  // 获取token
  if (to.path === '/login') return next()
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login')
  next()
})

export default router

import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/login.vue'
import Home from './components/home.vue'
import Welcome from './components/welcome.vue'
import Users from './components/user/users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/roles.vue'
import Cate from './components/goods/cate.vue'
import Params from './components//goods/params.vue'
import GoodList from './components//goods/list.vue'
import Add from './components//goods/add.vue'
Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home', component: Home, redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodList },
        { path: '/goods/add', component: Add },
      ]
    },
  ],
})
// next()放行    next(’/...‘)强制跳转路径
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
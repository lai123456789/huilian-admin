import router from '.'
import store from '@/store'
import { getStorage } from '@/utils/storage'
import { eachTree } from 'xe-utils'
import constant from '@/constant'
import config from '@/config'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// get-page-title文件主要是网站的标题，get-page-title通过依赖setting.js里的title变量修改网站标题
// 如果需要更改网站的标题，可以直接到setting.js修改title属性
const getPageTitle = (pageTitle) => {
  if (pageTitle) {
    return `${pageTitle} - ${config.title}`
  }
  return `${config.title}`
}

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const assignTierTree2Clap = trees => {
  const arr = []
  trees.forEach(tree => {
    const obj = Object.assign({}, tree)
    obj.children = []
    if (tree.children) {
      eachTree(tree.children, item => {
        const o = Object.assign({}, item)
        delete o.children
        obj.children.push(o)
      })
    }
    arr.push(obj)
  })
  return arr
}

router.beforeEach(async (to, _, next) => {
  // start progress bar
  NProgress.start()

  document.title = getPageTitle(to.meta.title)

  // 确定用户是否已登录
  const hasToken = getStorage({ name: constant.STORAGE_ACCESS_TOKEN })

  if (hasToken) {
    if (to.path === '/login') {
      // 如果用户存在令牌的情况请求登录页面，就让用户直接跳转到首页，避免存在重复登录的情况
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // 是否存在异步获取的菜单数据
      const asyncRoutes = store.getters.asyncRoutes && store.getters.asyncRoutes.length
      if (asyncRoutes) {
        next()
      } else {
        try {
          await store.dispatch('user/getUserInfo')
          const accessRoutes = await store.dispatch('permission/getRoutes')

          // 动态添加可访问路由
          router.addRoutes(assignTierTree2Clap(accessRoutes))

          next({ ...to, replace: true })
        } catch (error) {
          console.log('permission 这里被触发了', error)
          // 如果出错了，把令牌去掉，并让用户重新去到登录页面
          // await store.dispatch('user/logout')
          NProgress.done()
          next()
        }
      }
    }
  } else {
    // 这里是没有令牌的情况
    // 还记得上面的白名单吗，现在起作用了
    if (config.whiteList.indexOf(to.path) !== -1) {
      // 判断用户请求的路由是否在白名单里
      // 不是-1就证明存在白名单里，不管你有没有令牌，都直接去到白名单路由对应的页面
      next()
    } else {
      // 如果这个页面不在白名单里，直接跳转到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 刷新页面加载完之后关闭应用全局loading的效果
  document.getElementById('app-loading').style.display = 'none'
  // 每次请求结束后都需要关闭进度条
  NProgress.done()
})

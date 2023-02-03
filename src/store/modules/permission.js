import { getCurrentUserMenu } from '@/api/admin/menu'
import { constantRoutes } from '@/router'
import { isExternal } from '@/utils'
import { mapTree, camelCase } from 'xe-utils'
import enums from '@/enums'
import Layout from '@/layout'

const mutationsKey = {
  SET_ROUTES: 'SET_ROUTES',
  CLEAR_ASYNC_ROUTES: 'CLEAR_ASYNC_ROUTES',
  SET_MENU_MAP: 'SET_MENU_MAP'
}

const state = {
  menuMap: {},
  routes: [],
  asyncRoutes: []
}

const menuMap = {}
let routeConfigs = []

// 不放入路由的配置表的黑名单
const blacks = ['/ureport/preview', '/jmreport/view', '/jmreport/list', '/voucher-view']
let routeFirstId

/**
 * 处理菜单路径转换成name值
 * @param {string} path
 * @returns {string} 返回处理好的name值
 */
const handleRouteName = (path) => {
  let str = path
  if (str.charAt(0) === '/') {
    str = str.substring(1)
  }
  str.replaceAll('/', '-')
  const camelCaseStr = camelCase(str)
  return `${camelCaseStr.charAt(0).toUpperCase()}${camelCaseStr.slice(1)}`
}

/**
 * 替换预设的占位符内容, 后续有新加的占位符都可以在这里定义
 * @param {string} path
 * @returns
 */
const handleContentPlaceHolder = (path) => {
  return path.replace(/\{\{(.+?)\}\}/, function (_, $2) {
    if ($2 === 'domianName') {
      // 替换成当前的路径上的域名
      return window.origin
    }
    return path
  })
}

// 处理异步路由数据
const handleAsyncRoutes = (asyncRoutes) => {
  return mapTree(asyncRoutes, (route) => {
    const { id, name, openMode, path, icon, url, children } = route

    const newRoute = {
      meta: {
        id
      }
    }

    const newUrl = url ? handleContentPlaceHolder(url) : ''
    let externalUrl
    let isDir = false

    // 获取到菜单路径为path的值
    if (newUrl) {
      // 处理外链
      if (isExternal(newUrl)) {
        if (openMode === enums.OPEN_MODE.getFieldByKey('EXTERNAL')) {
          // 不处理path
          newRoute.path = newUrl
        } else {
          // 内部打开的话需要iframe组件作为载体展示
          newRoute.path = `/iframe/external/${id}`
          externalUrl = newUrl
        }
        // 先取菜单路径做转换成路由名称, 没有菜单路径的话取菜单id
        newRoute.name = id
      } else {
        // 前面是否有/开头，没有就加一个/
        const newPath = newUrl.charAt(0) === '/' ? newUrl : `/${newUrl}`
        newRoute.path = newPath
        // 先取菜单路径做转换成路由名称, 没有菜单路径的话取菜单id
        newRoute.name = newUrl ? handleRouteName(newUrl) : id
      }
    } else {
      newRoute.path = ''
    }

    if (route.parentId === '-1') {
      // 保存当前的第一级菜单的id供后边的子级使用
      routeFirstId = id
    } else {
      // 保存第一级菜单的id
      newRoute.meta.routeFirstId = routeFirstId
    }

    // 其余的组件如果指定组件路径可直接使用
    if (path) {
      newRoute.component = (resolve) => require([`@/views${path}`], resolve)
    }

    // 这里没有子集后台不返回children字段，所以做兼容处理
    if (children === void 0) {
      newRoute.children = []
    } else {
      if (children.length > 0) {
        isDir = true
      }
    }

    // 在meta上设置title
    newRoute.meta.title = name
    // 用来在开发环境下快速找到文件路径
    newRoute.meta.componentPath = path ? `/views${path}` : void 0

    // 在黑名单的路由和外链不会加在配置表中
    if (!(newUrl && blacks.some(s => newUrl.includes(s))) && !(isExternal(newUrl))) {
      if (openMode === enums.OPEN_MODE.getFieldByKey('EXTERNAL')) {
        routeConfigs.push(newRoute)
      } else {
        routeConfigs[0].children.push(newRoute)
      }
    } else {
      // 如果不是外链且外部打开的时候，使用在前面加一个外部前缀
      if (!(isExternal(newUrl)) && openMode === enums.OPEN_MODE.getFieldByKey('EXTERNAL')) {
        newRoute.path = `/external${newRoute.path}`
      }
      menuMap[newRoute.path] = {
        id,
        routeFirstId,
        externalUrl,
        title: name
      }
    }

    return {
      path: newRoute.path,
      meta: {
        id,
        title: name,
        isDir,
        icon,
        openMode,
        externalUrl
      },
      children
    }
  })
}

const mutations = {
  [mutationsKey.SET_ROUTES]: (state, routes) => {
    state.asyncRoutes = routes
    state.routes = routes.concat(constantRoutes)
  },
  [mutationsKey.CLEAR_ASYNC_ROUTES]: (state) => {
    state.asyncRoutes = []
    state.routes = constantRoutes
  },
  [mutationsKey.SET_MENU_MAP]: (state, menuMap) => {
    state.menuMap = menuMap
  }
}

const actions = {
  // 获取路由数据
  async getRoutes({ commit }) {
    const res = await getCurrentUserMenu()
    routeConfigs = [
      {
        path: '',
        component: Layout,
        children: []
      }
    ]
    const accessedRoutes = handleAsyncRoutes(res.data)
    const routers = routeConfigs.concat(accessedRoutes, [{ path: '*', redirect: '/404', hidden: true }])
    commit(mutationsKey.SET_ROUTES, accessedRoutes)
    commit(mutationsKey.SET_MENU_MAP, menuMap)
    return routers
  },
  // 清除异步获取到路由数据
  clearAsyncRoutes({ commit }) {
    commit(mutationsKey.CLEAR_ASYNC_ROUTES)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

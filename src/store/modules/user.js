import { login, logout, refreshToken, checkToken, getInfo } from '@/api/admin/auth'
import { getTenantById } from '@/api/admin/tenant'
import router, { resetRouter } from '@/router'
import encryption from '@/utils/aes'
import { getStorage, setStorage, removeStorage } from '@/utils/storage'
import constant from '@/constant'
import config from '@/config'

const mutationsKey = {
  SET_ACCESS_TOKEN: 'SET_ACCESS_TOKEN',
  CLEAR_ACCESS_TOKEN: 'CLEAR_ACCESS_TOKEN',
  SET_USER_INFO: 'SET_USER_INFO',
  CLEAR_USER_INFO: 'CLEAR_USER_INFO',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  CLEAR_PERMISSIONS: 'CLEAR_PERMISSIONS',
  SET_REFRESH_TOKEN: 'SET_REFRESH_TOKEN',
  CLEAR_REFRESH_TOKEN: 'CLEAR_REFRESH_TOKEN',
  SET_EXPIRES_IN: 'SET_EXPIRES_IN',
  CLEAR_EXPIRES_IN: 'CLEAR_EXPIRES_IN',
  SET_TENANT_INFO: 'SET_TENANT_INFO',
  CLEAR_TENANT_INFO: 'CLEAR_TENANT_INFO',
  SET_JMREPORT_ACCESS_TOKEN: 'SET_JMREPORT_ACCESS_TOKEN',
  CLEAR_JMREPORT_ACCESS_TOKEN: 'CLEAR_JMREPORT_ACCESS_TOKEN',
  SET_OLD_ACCESS_TOKEN: 'SET_OLD_ACCESS_TOKEN',
  CLEAR_OLD_ACCESS_TOKEN: 'CLEAR_OLD_ACCESS_TOKEN'
}

const state = {
  accessToken: getStorage({ name: constant.STORAGE_ACCESS_TOKEN }) || '',
  refreshToken: getStorage({ name: constant.STORAGE_REFRESH_TOKEN }) || '',
  userInfo: getStorage({ name: constant.STORAGE_USER_INFO }) || {},
  permissions: getStorage({ name: constant.STORAGE_PERMISSIONS }) || {},
  expiresIn: getStorage({ name: constant.STORAGE_EXPIRES_IN }) || 0,
  tenantInfo: getStorage({ name: constant.STORAGE_TENANT_INFO }) || {},
  timer: null,
  refreshLock: false
}

const mutations = {
  // 设置accessToken
  [mutationsKey.SET_ACCESS_TOKEN]: (state, accessToken) => {
    state.accessToken = accessToken
    setStorage({ name: constant.STORAGE_ACCESS_TOKEN, content: accessToken })
  },
  // 清除accessToken
  [mutationsKey.CLEAR_ACCESS_TOKEN]: (state) => {
    state.accessToken = ''
    removeStorage({ name: constant.STORAGE_ACCESS_TOKEN })
  },
  // 设置用户信息
  [mutationsKey.SET_USER_INFO]: (state, userInfo) => {
    state.userInfo = userInfo
    setStorage({ name: constant.STORAGE_USER_INFO, content: userInfo })
  },
  // 清除用户信息
  [mutationsKey.CLEAR_USER_INFO]: (state) => {
    state.userInfo = ''
    removeStorage({ name: constant.STORAGE_USER_INFO })
  },
  // 设置租户信息
  [mutationsKey.SET_TENANT_INFO]: (state, tenantInfo) => {
    state.tenantInfo = tenantInfo
    setStorage({ name: constant.STORAGE_TENANT_INFO, content: tenantInfo })
  },
  // 清除租户信息
  [mutationsKey.CLEAR_TENANT_INFO]: (state) => {
    state.tenantInfo = ''
    removeStorage({ name: constant.STORAGE_TENANT_INFO })
  },
  // 设置按钮权限集合
  [mutationsKey.SET_PERMISSIONS]: (state, permissions) => {
    const perms = {}
    for (let i = 0; i < permissions.length; i++) {
      perms[permissions[i]] = true
    }
    state.permissions = perms
    setStorage({ name: constant.STORAGE_PERMISSIONS, content: perms })
  },
  // 清除按钮权限集合
  [mutationsKey.CLEAR_PERMISSIONS]: (state) => {
    state.permissions = {}
    removeStorage({ name: constant.STORAGE_PERMISSIONS })
  },
  // 设置刷新token
  [mutationsKey.SET_REFRESH_TOKEN]: (state, refreshToken) => {
    state.refreshToken = refreshToken
    setStorage({ name: constant.STORAGE_REFRESH_TOKEN, content: state.refreshToken })
  },
  // 清除刷新token
  [mutationsKey.CLEAR_REFRESH_TOKEN]: (state) => {
    state.refreshToken = ''
    removeStorage({ name: constant.STORAGE_REFRESH_TOKEN })
  },
  // 设置过期时间
  [mutationsKey.SET_EXPIRES_IN]: (state, expiresIn) => {
    /* 保存当前登陆时间 */
    const nowTime = parseInt(new Date().getTime() / 1000)
    state.expiresIn = expiresIn + nowTime
    setStorage({ name: constant.STORAGE_EXPIRES_IN, content: state.expiresIn })
  },
  // 清除过期时间
  [mutationsKey.CLEAR_EXPIRES_IN]: (state) => {
    state.expiresIn = 0
    removeStorage({ name: constant.STORAGE_EXPIRES_IN })
  },
  // 设置积木报表的token
  [mutationsKey.SET_JMREPORT_ACCESS_TOKEN]: (_, token) => {
    localStorage.setItem(constant.STORAGE_JMREPORT_ACCESS_TOKEN, token)
  },
  // 清除积木报表的token
  [mutationsKey.CLEAR_JMREPORT_ACCESS_TOKEN]: () => {
    localStorage.removeItem(constant.STORAGE_JMREPORT_ACCESS_TOKEN)
  },
  // 设置旧代码的token标识符
  [mutationsKey.SET_OLD_ACCESS_TOKEN]: (_, token) => {
    localStorage.setItem(constant.STORAGE_OLD_ACCESS_TOKEN, JSON.stringify({ content: token }))
  },
  // 清除旧代码的token标识符
  [mutationsKey.CLEAR_OLD_ACCESS_TOKEN]: () => {
    localStorage.removeItem(constant.STORAGE_OLD_ACCESS_TOKEN)
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const user = encryption({
      data: userInfo,
      key: 'Ascp@10240000000',
      param: ['password']
    })
    return new Promise((resolve, reject) => {
      login({ username: user.username.trim(), password: user.password }).then(response => {
        const { access_token, expires_in, refresh_token, user_info } = response
        commit(mutationsKey.SET_ACCESS_TOKEN, access_token)
        commit(mutationsKey.SET_REFRESH_TOKEN, refresh_token)
        commit(mutationsKey.SET_EXPIRES_IN, expires_in)
        commit(mutationsKey.SET_JMREPORT_ACCESS_TOKEN, `Bearer ${access_token}`)
        commit(mutationsKey.SET_OLD_ACCESS_TOKEN, access_token)

        getTenantById(user_info.tenantId).then((tenantInfo) => {
          commit(mutationsKey.SET_TENANT_INFO, tenantInfo.data)
          resolve()
        }).catch(error => {
          reject(error)
        })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  getUserInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo().then((res) => {
        const data = res.data || {}
        commit(mutationsKey.SET_USER_INFO, data.sysUser)
        commit(mutationsKey.SET_PERMISSIONS, data.permissions || {})
        resolve(data)
      }).catch(() => {
        reject()
      })
    })
  },

  // 退出登录
  logout({ state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.accessToken).then(() => {
        dispatch('retracement')
        router.replace('/login')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 刷新token
  refreshToken({ commit, state }) {
    return new Promise((resolve, reject) => {
      refreshToken(state.refreshToken).then(response => {
        const { access_token, expires_in, refresh_token } = response
        commit(mutationsKey.SET_ACCESS_TOKEN, access_token)
        commit(mutationsKey.SET_REFRESH_TOKEN, refresh_token)
        commit(mutationsKey.SET_EXPIRES_IN, expires_in)
        commit(mutationsKey.SET_JMREPORT_ACCESS_TOKEN, `Bearer ${access_token}`)
        commit(mutationsKey.SET_OLD_ACCESS_TOKEN, access_token)

        resolve({ access_token })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 开启刷新token轮询
  openRefreshToken({ state, dispatch }) {
    this.timer = setInterval(() => {
      const token = getStorage({ name: constant.STORAGE_ACCESS_TOKEN })
      checkToken(token)
        .then((res) => {
          const expire = res && res.exp
          if (expire) {
            const expiredPeriod = expire * 1000 - new Date().getTime()
            // 小于半小时自动续约
            if (expiredPeriod <= 30 * 60 * 1000) {
              if (!this.refreshLock) {
                state.refreshLock = true
                dispatch('refreshToken').catch(() => {
                  clearInterval(state.timer)
                })
                state.refreshLock = false
              }
            }
          }
        })
        .catch(error => {
          console.error(error)
        })
    }, config.refreshTokenExecTime)
  },

  // 重置刷新token相关的状态
  resetRefreshTokenState({ state }) {
    clearInterval(state.timer)
    state.timer = null
    state.refreshLock = false
  },

  // 重置各个状态方法
  retracement({ commit, dispatch }) {
    commit(mutationsKey.CLEAR_ACCESS_TOKEN)
    commit(mutationsKey.CLEAR_USER_INFO)
    commit(mutationsKey.CLEAR_PERMISSIONS)
    commit(mutationsKey.CLEAR_REFRESH_TOKEN)
    commit(mutationsKey.CLEAR_EXPIRES_IN)
    commit(mutationsKey.CLEAR_JMREPORT_ACCESS_TOKEN)
    commit(mutationsKey.CLEAR_OLD_ACCESS_TOKEN)
    dispatch('tagsView/delAllViews', null, { root: true })
    dispatch('permission/clearAsyncRoutes', null, { root: true })
    resetRouter()
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

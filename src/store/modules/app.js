import { getSystemParamSysPublicParam } from '@/api/admin/sys-public-param'
import constant from '@/constant'
import { getStorage, setStorage } from '@/utils/storage'

export const mutationsKey = {
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  CLOSE_SIDEBAR: 'CLOSE_SIDEBAR',
  TOGGLE_BROWER_TABS_VISIBILITY: 'TOGGLE_BROWER_TABS_VISIBILITY',
  SET_SYSTEM_CONFIG: 'SET_SYSTEM_CONFIG'
}

const state = {
  sidebar: {
    opened: getStorage({ name: constant.STORAGE_SIDEBAR_STATUS }) ? !!getStorage({ name: constant.STORAGE_SIDEBAR_STATUS }) : true
  },
  systemConfig: {},
  isBrowserTabsVisibility: false
}

const mutations = {
  [mutationsKey.TOGGLE_SIDEBAR]: state => {
    state.sidebar.opened = !state.sidebar.opened
    if (state.sidebar.opened) {
      setStorage({ name: constant.STORAGE_SIDEBAR_STATUS, content: 1 })
    } else {
      setStorage({ name: constant.STORAGE_SIDEBAR_STATUS, content: 0 })
    }
  },
  [mutationsKey.CLOSE_SIDEBAR]: (state) => {
    setStorage({ name: constant.STORAGE_SIDEBAR_STATUS, content: 0 })
    state.sidebar.opened = false
  },
  [mutationsKey.TOGGLE_BROWER_TABS_VISIBILITY]: (state, isBrowserTabsVisibility) => {
    state.isBrowserTabsVisibility = isBrowserTabsVisibility
    setStorage({ name: constant.STORAGE_SIDEBAR_STATUS, content: isBrowserTabsVisibility })
  },
  [mutationsKey.SET_SYSTEM_CONFIG]: (state, systemConfig) => {
    state.systemConfig = systemConfig
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit(mutationsKey.TOGGLE_SIDEBAR)
  },
  toggleBrowserTabsVisibility({ commit }, payload) {
    commit(mutationsKey.TOGGLE_BROWER_TABS_VISIBILITY, payload)
  },
  getSystemConfigInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (!Object.keys(state.systemConfig).length) {
        getSystemParamSysPublicParam().then((res) => {
          commit('SET_SYSTEM_CONFIG', res.data || {})
          resolve(state.systemConfig)
        }).catch(() => {
          reject()
        })
      } else {
        resolve(state.systemConfig)
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

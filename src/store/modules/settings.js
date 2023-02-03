import variables from '@/styles/variables.scss'
import config from '@/config'
import constant from '@/constant'
import { getStorage, setStorage } from '@/utils/storage'

const { showSidebarLogo } = config

const settings = getStorage({ name: constant.STORAGE_SETTINGS })

const state = {
  themeColor: settings ? settings.themeColor : variables.themeColor,
  sidebarLogo: showSidebarLogo
}

const mutations = {
  SET_THEME_COLOR: (state, color) => {
    state.themeColor = color
    setStorage({ name: constant.STORAGE_SETTINGS, content: state })
  }
}

const actions = {
  setThemeColor({ commit }, color) {
    commit('SET_THEME_COLOR', color)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}


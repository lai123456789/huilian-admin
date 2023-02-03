const mutationsKey = {
  ADD_VISITED_VIEW: 'ADD_VISITED_VIEW',
  ADD_CACHED_VIEW: 'ADD_CACHED_VIEW',
  DEL_VISITED_VIEW: 'DEL_VISITED_VIEW',
  DEL_CACHED_VIEW: 'DEL_CACHED_VIEW',
  DEL_OTHERS_VISITED_VIEWS: 'DEL_OTHERS_VISITED_VIEWS',
  DEL_OTHERS_CACHED_VIEWS: 'DEL_OTHERS_CACHED_VIEWS',
  DEL_ALL_VISITED_VIEWS: 'DEL_ALL_VISITED_VIEWS',
  DEL_ALL_CACHED_VIEWS: 'DEL_ALL_CACHED_VIEWS',
  UPDATE_VISITED_VIEW: 'UPDATE_VISITED_VIEW'
}

const dispatchKey = {
  ADD_VISITED_VIEW: 'addVisitedView',
  ADD_CACHED_VIEW: 'addCachedView',
  DEL_VISITED_VIEW: 'delVisitedView',
  DEL_CACHED_VIEW: 'delCachedView',
  DEL_OTHERS_VISITED_VIEWS: 'delOthersVisitedViews',
  DEL_OTHERS_CACHED_VIEWS: 'delOthersCachedViews',
  DEL_ALL_VISITED_VIEWS: 'delAllVisitedViews',
  DEL_ALL_CACHED_VIEWS: 'delAllCachedViews'
}

const state = {
  visitedViews: [],
  cachedViews: []
}

const mutations = {
  [mutationsKey.ADD_VISITED_VIEW]: (state, view) => {
    if (state.visitedViews.some(v => v.path === view.path)) return

    state.visitedViews.push(
      Object.assign({}, view, {
        title: view.meta.title || 'no-name'
      })
    )
  },
  [mutationsKey.ADD_CACHED_VIEW]: (state, view) => {
    if (state.cachedViews.includes(view.name)) return
    if (!view.meta.noCache && !view.meta.iframe) {
      state.cachedViews.push(view.name)
    }
  },

  [mutationsKey.DEL_VISITED_VIEW]: (state, view) => {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.path === view.path) {
        state.visitedViews.splice(i, 1)
        break
      }
    }
  },
  [mutationsKey.DEL_CACHED_VIEW]: (state, view) => {
    const index = state.cachedViews.indexOf(view.name)
    index > -1 && state.cachedViews.splice(index, 1)
  },

  [mutationsKey.DEL_OTHERS_VISITED_VIEWS]: (state, view) => {
    state.visitedViews = state.visitedViews.filter(v => {
      return v.meta.affix || v.path === view.path
    })
  },
  [mutationsKey.DEL_OTHERS_CACHED_VIEWS]: (state, view) => {
    const index = state.cachedViews.indexOf(view.name)
    if (index > -1) {
      state.cachedViews = state.cachedViews.slice(index, index + 1)
    } else {
      // if index = -1, there is no cached tags
      state.cachedViews = []
    }
  },

  [mutationsKey.DEL_ALL_VISITED_VIEWS]: state => {
    // keep affix tags
    const affixTags = state.visitedViews.filter(tag => tag.meta.affix)
    state.visitedViews = affixTags
  },
  [mutationsKey.DEL_ALL_CACHED_VIEWS]: state => {
    state.cachedViews = []
  },

  [mutationsKey.UPDATE_VISITED_VIEW]: (state, view) => {
    for (let v of state.visitedViews) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
  }
}

const actions = {
  addView({ dispatch }, view) {
    dispatch(dispatchKey.ADD_VISITED_VIEW, view)
    dispatch(dispatchKey.ADD_CACHED_VIEW, view)
  },
  addVisitedView({ commit }, view) {
    commit(mutationsKey.ADD_VISITED_VIEW, view)
  },
  addCachedView({ commit }, view) {
    commit(mutationsKey.ADD_CACHED_VIEW, view)
  },

  delView({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch(dispatchKey.DEL_VISITED_VIEW, view)
      dispatch(dispatchKey.DEL_CACHED_VIEW, view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  delVisitedView({ commit, state }, view) {
    return new Promise(resolve => {
      commit(mutationsKey.DEL_VISITED_VIEW, view)
      resolve([...state.visitedViews])
    })
  },
  delCachedView({ commit, state }, view) {
    return new Promise(resolve => {
      commit(mutationsKey.DEL_CACHED_VIEW, view)
      resolve([...state.cachedViews])
    })
  },

  delOthersViews({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch(dispatchKey.DEL_OTHERS_VISITED_VIEWS, view)
      dispatch(dispatchKey.DEL_OTHERS_CACHED_VIEWS, view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  delOthersVisitedViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit(mutationsKey.DEL_OTHERS_VISITED_VIEWS, view)
      resolve([...state.visitedViews])
    })
  },
  delOthersCachedViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit(mutationsKey.DEL_OTHERS_CACHED_VIEWS, view)
      resolve([...state.cachedViews])
    })
  },

  delAllViews({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch(dispatchKey.DEL_ALL_VISITED_VIEWS, view)
      dispatch(dispatchKey.DEL_ALL_CACHED_VIEWS, view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  delAllVisitedViews({ commit, state }) {
    return new Promise(resolve => {
      commit(mutationsKey.DEL_ALL_VISITED_VIEWS)
      resolve([...state.visitedViews])
    })
  },
  delAllCachedViews({ commit, state }) {
    return new Promise(resolve => {
      commit(mutationsKey.DEL_ALL_CACHED_VIEWS)
      resolve([...state.cachedViews])
    })
  },

  updateVisitedView({ commit }, view) {
    commit(mutationsKey.UPDATE_VISITED_VIEW, view)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

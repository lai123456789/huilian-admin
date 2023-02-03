const getters = {
  sidebar: state => state.app.sidebar,
  isBrowserTabsVisibility: state => state.app.isBrowserTabsVisibility,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  accessToken: state => state.user.accessToken,
  permissions: state => state.user.permissions,
  routes: state => state.permission.routes,
  asyncRoutes: state => state.permission.asyncRoutes,
  menuMap: state => state.permission.menuMap
}
export default getters

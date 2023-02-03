<script>
import fackClickOutSide from '@/mixins/fack-click-out-side'
import browserTabsVisibility from './mixins/browser-tabs-visibility'
import config from '@/config'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  mixins: [fackClickOutSide, browserTabsVisibility],
  computed: {
    ...mapGetters(['menuMap'])
  },
  watch: {
    $route: {
      handler(route) {
        if (route.path !== '/') {
          let title = route.meta.title
          if (config.staticRouteWhites.includes(route.name)) {
            title = this.menuMap[decodeURI(route.path)].title
          }
          process.env.NODE_ENV === 'development' && console.log(`🧭(${title})本地文件路径: %c${route.meta.componentPath}`, 'color: #82d6d5')
        }
      },
      immediate: true
    }
  }
}
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

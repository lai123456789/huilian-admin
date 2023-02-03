import store from '@/store'

export default {
  mounted() {
    window.document.addEventListener('visibilitychange', this.handleBrowserTabsVisibilityChange)
  },
  methods: {
    handleBrowserTabsVisibilityChange() {
      /**
       * 可以通过document.hidden属性（布尔类型）来判断
       * indow.document.hidden (true/false)
       * document.visibilityState拥有两种字符串枚举值（'visible' 和 'hidden'）
       */
      if (window.document.visibilityState === 'visible') {
        // 当页签处于可见状态
        store.dispatch('app/toggleBrowserTabsVisibility', true)
      } else {
        // 当页签处于不可见状态
        store.dispatch('app/toggleBrowserTabsVisibility', false)
      }
    }
  }
}

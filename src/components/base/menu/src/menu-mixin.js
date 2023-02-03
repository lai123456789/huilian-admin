export default {
  inject: ['rootMenu'],
  computed: {
    indexPath() {
      const path = [this.index]
      let parent = this.$parent
      while (parent.$options.componentName !== 'BaseMenu') {
        if (parent.index) {
          path.unshift(parent.index)
        }
        parent = parent.$parent
      }
      return path
    },
    parentMenu() {
      let parent = this.$parent
      while (
        parent &&
        ['BaseMenu', 'BaseSubmenu'].indexOf(parent.$options.componentName) === -1
      ) {
        parent = parent.$parent
      }
      return parent
    },
    paddingStyle() {
      if (this.rootMenu.mode !== 'vertical') return {}

      let padding = this.rootMenu.indent
      let parent = this.$parent

      if (this.rootMenu.collapse) {
        padding = this.rootMenu.indent
      } else {
        while (parent && parent.$options.componentName !== 'BaseMenu') {
          if (parent.$options.componentName === 'BaseSubmenu') {
            padding += this.rootMenu.indent
          }
          parent = parent.$parent
        }
      }
      return { paddingLeft: padding + 'px' }
    }
  }
}

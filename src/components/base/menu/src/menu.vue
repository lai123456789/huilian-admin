<script type="text/jsx">
import emitter from 'element-ui/lib/mixins/emitter'
import Migrating from 'element-ui/lib/mixins/migrating'
import Menubar from 'element-ui/lib/utils/menu/aria-menubar'
import { addClass, removeClass, hasClass } from 'element-ui/lib/utils/dom'

export default {
  name: 'BaseMenu',

  components: {
    'el-menu-collapse-transition': {
      functional: true,
      render(createElement, context) {
        const data = {
          props: {
            mode: 'out-in'
          },
          on: {
            beforeEnter(el) {
              el.style.opacity = 0.2
            },

            enter(el) {
              addClass(el, 'el-opacity-transition')
              el.style.opacity = 1
            },

            afterEnter(el) {
              removeClass(el, 'el-opacity-transition')
              el.style.opacity = ''
            },

            beforeLeave(el) {
              if (!el.dataset) el.dataset = {}

              if (hasClass(el, 'el-menu--collapse')) {
                removeClass(el, 'el-menu--collapse')
                el.dataset.oldOverflow = el.style.overflow
                el.dataset.scrollWidth = el.clientWidth
                addClass(el, 'el-menu--collapse')
              } else {
                addClass(el, 'el-menu--collapse')
                el.dataset.oldOverflow = el.style.overflow
                el.dataset.scrollWidth = el.clientWidth
                removeClass(el, 'el-menu--collapse')
              }

              el.style.width = el.scrollWidth + 'px'
              el.style.overflow = 'hidden'
            },

            leave(el) {
              addClass(el, 'horizontal-collapse-transition')
              el.style.width = el.dataset.scrollWidth + 'px'
            }
          }
        }
        return createElement('transition', data, context.children)
      }
    }
  },

  mixins: [emitter, Migrating],

  props: {
    mode: {
      type: String,
      default: 'vertical'
    },
    defaultActive: {
      type: String,
      default: ''
    },
    defaultOpeneds: Array,
    uniqueOpened: Boolean,
    router: Boolean,
    menuTrigger: {
      type: String,
      default: 'hover'
    },
    collapse: Boolean,
    backgroundColor: String,
    textColor: String,
    activeTextColor: String,
    collapseTransition: {
      type: Boolean,
      default: true
    },
    indent: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      activeIndex: this.defaultActive,
      openedMenus: (this.defaultOpeneds && !this.collapse) ? this.defaultOpeneds.slice(0) : [],
      items: {},
      submenus: {}
    }
  },
  computed: {
    hoverBackground() {
      return this.backgroundColor ? this.mixColor(this.backgroundColor, 0.2) : ''
    },
    isMenuPopup() {
      return this.mode === 'horizontal' || (this.mode === 'vertical' && this.collapse)
    }
  },
  watch: {
    defaultActive(value) {
      if (!this.items[value]) {
        this.activeIndex = null
      }
      this.updateActiveIndex(value)
    },

    defaultOpeneds(value) {
      if (!this.collapse) {
        this.openedMenus = value
      }
    },

    collapse(value) {
      if (value) this.openedMenus = []
      this.broadcast('BaseSubmenu', 'toggle-collapse', value)
    }
  },
  mounted() {
    this.initOpenedMenu()
    this.$on('item-click', this.handleItemClick)
    this.$on('submenu-click', this.handleSubmenuClick)
    if (this.mode === 'horizontal') {
        new Menubar(this.$el); // eslint-disable-line
    }
    this.$watch('items', this.updateActiveIndex)
  },
  methods: {
    updateActiveIndex(val) {
      const item = this.items[val] || this.items[this.activeIndex] || this.items[this.defaultActive]
      if (item) {
        this.activeIndex = item.index
        this.initOpenedMenu()
      } else {
        this.activeIndex = null
      }
    },

    getMigratingConfig() {
      return {
        props: {
          'theme': 'theme is removed.'
        }
      }
    },
    getColorChannels(color) {
      color = color.replace('#', '')
      if (/^[0-9a-fA-F]{3}$/.test(color)) {
        color = color.split('')
        for (let i = 2; i >= 0; i--) {
          color.splice(i, 0, color[i])
        }
        color = color.join('')
      }
      if (/^[0-9a-fA-F]{6}$/.test(color)) {
        return {
          red: parseInt(color.slice(0, 2), 16),
          green: parseInt(color.slice(2, 4), 16),
          blue: parseInt(color.slice(4, 6), 16)
        }
      } else {
        return {
          red: 255,
          green: 255,
          blue: 255
        }
      }
    },
    mixColor(color, percent) {
      let { red, green, blue } = this.getColorChannels(color)
      if (percent > 0) { // shade given color
        red *= 1 - percent
        green *= 1 - percent
        blue *= 1 - percent
      } else { // tint given color
        red += (255 - red) * percent
        green += (255 - green) * percent
        blue += (255 - blue) * percent
      }
      return `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`
    },
    addItem(item) {
      this.$set(this.items, item.index, item)
    },
    removeItem(item) {
      delete this.items[item.index]
    },
    addSubmenu(item) {
      this.$set(this.submenus, item.index, item)
    },
    removeSubmenu(item) {
      delete this.submenus[item.index]
    },
    openMenu(index, indexPath) {
      const openedMenus = this.openedMenus
      if (openedMenus.indexOf(index) !== -1) return
      // 将不在该菜单路径下的其余菜单收起
      // collapse all menu that are not under current menu item
      if (this.uniqueOpened) {
        this.openedMenus = openedMenus.filter(index => {
          return indexPath.indexOf(index) !== -1
        })
      }
      this.openedMenus.push(index)
    },
    closeMenu(index) {
      const i = this.openedMenus.indexOf(index)
      if (i !== -1) {
        this.openedMenus.splice(i, 1)
      }
    },
    handleSubmenuClick(submenu) {
      const { index, indexPath } = submenu
      const isOpened = this.openedMenus.indexOf(index) !== -1

      if (isOpened) {
        this.closeMenu(index)
        this.$emit('close', index, indexPath)
      } else {
        this.openMenu(index, indexPath)
        this.$emit('open', index, indexPath)
      }
    },
    handleItemClick(item) {
      const { index, indexPath } = item
      const oldActiveIndex = this.activeIndex
      const hasIndex = item.index !== null

      if (hasIndex) {
        this.activeIndex = item.index
      }

      this.$emit('select', index, indexPath, item)

      if (this.mode === 'horizontal' || this.collapse) {
        this.openedMenus = []
      }

      if (this.router && hasIndex) {
        this.routeToItem(item, (error) => {
          this.activeIndex = oldActiveIndex
          if (error) {
            // vue-router 3.1.0+ push/replace cause NavigationDuplicated error
            // https://github.com/ElemeFE/element/issues/17044
            if (error.name === 'NavigationDuplicated') return
            console.error(error)
          }
        })
      }
    },
    // 初始化展开菜单
    // initialize opened menu
    initOpenedMenu() {
      const index = this.activeIndex
      const activeItem = this.items[index]
      if (!activeItem || this.mode === 'horizontal' || this.collapse) return

      const indexPath = activeItem.indexPath

      // 展开该菜单项的路径上所有子菜单
      // expand all submenus of the menu item
      indexPath.forEach(index => {
        const submenu = this.submenus[index]
        submenu && this.openMenu(index, submenu.indexPath)
      })
    },
    routeToItem(item, onError) {
      const route = item.route || item.index
      try {
        this.$router.push(route, () => {}, onError)
      } catch (e) {
        console.error(e)
      }
    },
    open(index) {
      const { indexPath } = this.submenus[index.toString()]
      indexPath.forEach(i => this.openMenu(i, indexPath))
    },
    close(index) {
      this.closeMenu(index)
    }
  },

  render() {
    const component = (
      <ul
        role="menubar"
        key={ +this.collapse }
        style={{ backgroundColor: this.backgroundColor || '' }}
        class={{
          'el-menu--horizontal': this.mode === 'horizontal',
          'el-menu--collapse': this.collapse,
          'el-menu': true
        }}
      >
        { this.$slots.default }
      </ul>
    )

    if (this.collapseTransition) {
      return (
        <el-menu-collapse-transition>
          { component }
        </el-menu-collapse-transition>
      )
    } else {
      return component
    }
  },

  componentName: 'BaseMenu',

  provide() {
    return {
      rootMenu: this
    }
  }
}
</script>

<style lang="scss">
.fade-in-linear-enter-active,
.fade-in-linear-leave-active {
  transition: opacity 0.2s linear;
}
.fade-in-linear-enter,
.fade-in-linear-leave,
.fade-in-linear-leave-active {
  opacity: 0;
}
.el-fade-in-linear-enter-active,
.el-fade-in-linear-leave-active {
  transition: opacity 0.2s linear;
}
.el-fade-in-linear-enter,
.el-fade-in-linear-leave,
.el-fade-in-linear-leave-active {
  opacity: 0;
}
.el-fade-in-enter-active,
.el-fade-in-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
.el-fade-in-enter,
.el-fade-in-leave-active {
  opacity: 0;
}
.el-zoom-in-center-enter-active,
.el-zoom-in-center-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
.el-zoom-in-center-enter,
.el-zoom-in-center-leave-active {
  opacity: 0;
  transform: scaleX(0);
}
.el-zoom-in-top-enter-active,
.el-zoom-in-top-leave-active {
  opacity: 1;
  transform: scaleY(1);
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center top;
}
.el-zoom-in-top-enter,
.el-zoom-in-top-leave-active {
  opacity: 0;
  transform: scaleY(0);
}
.el-zoom-in-bottom-enter-active,
.el-zoom-in-bottom-leave-active {
  opacity: 1;
  transform: scaleY(1);
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center bottom;
}
.el-zoom-in-bottom-enter,
.el-zoom-in-bottom-leave-active {
  opacity: 0;
  transform: scaleY(0);
}
.el-zoom-in-left-enter-active,
.el-zoom-in-left-leave-active {
  opacity: 1;
  transform: scale(1, 1);
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: top left;
}
.el-zoom-in-left-enter,
.el-zoom-in-left-leave-active {
  opacity: 0;
  transform: scale(0.45, 0.45);
}
.collapse-transition {
  transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out;
}
.horizontal-collapse-transition {
  transition: 0.3s width ease-in-out, 0.3s padding-left ease-in-out, 0.3s padding-right ease-in-out;
}
.el-list-enter-active,
.el-list-leave-active {
  transition: all 1s;
}
.el-list-enter,
.el-list-leave-active {
  opacity: 0;
  transform: translateY(-30px);
}
.el-opacity-transition {
  transition: opacity 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
.el-menu {
  position: relative;
  margin: 0;
  padding-left: 0;
  border-right: solid 1px #e6e6e6;
  background-color: #ffffff;
  list-style: none;
}
.el-menu::after,
.el-menu::before {
  display: table;
  content: '';
}
.el-menu::after {
  clear: both;
}
.el-menu.el-menu--horizontal {
  border-bottom: solid 1px #e6e6e6;
}
.el-menu--horizontal {
  border-right: none;
}
.el-menu--horizontal > .el-menu-item {
  float: left;
  margin: 0;
  height: 60px;
  border-bottom: 2px solid transparent;
  color: #909399;
  line-height: 60px;
}
.el-menu--horizontal > .el-menu-item a,
.el-menu--horizontal > .el-menu-item a:hover {
  color: inherit;
}
.el-menu--horizontal > .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover {
  background-color: #ffffff;
}
.el-menu--horizontal > .el-submenu {
  float: left;
}
.el-menu--horizontal > .el-submenu:focus,
.el-menu--horizontal > .el-submenu:hover {
  outline: 0;
}
.el-menu--horizontal > .el-submenu:focus .el-submenu__title,
.el-menu--horizontal > .el-submenu:hover .el-submenu__title {
  color: #303133;
}
.el-menu--horizontal > .el-submenu.is-active .el-submenu__title {
  border-bottom: 2px solid #409eff;
  color: #303133;
}
.el-menu--horizontal > .el-submenu .el-submenu__title {
  height: 60px;
  line-height: 60px;
  border-bottom: 2px solid transparent;
  color: #909399;
}
.el-menu--horizontal > .el-submenu .el-submenu__title:hover {
  background-color: #ffffff;
}
.el-menu--horizontal > .el-submenu .el-submenu__icon-arrow {
  position: static;
  margin-top: -3px;
  margin-left: 8px;
  vertical-align: middle;
}
.el-menu--horizontal .el-menu .el-menu-item,
.el-menu--horizontal .el-menu .el-submenu__title {
  float: none;
  padding: 0 10px;
  height: 36px;
  color: #909399;
  background-color: #ffffff;
  line-height: 36px;
}
.el-menu--horizontal .el-menu .el-menu-item.is-active,
.el-menu--horizontal .el-menu .el-submenu.is-active > .el-submenu__title {
  color: #303133;
}
.el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  color: #303133;
  outline: 0;
}
.el-menu--horizontal > .el-menu-item.is-active {
  border-bottom: 2px solid #409eff;
  color: #303133;
}
.el-menu--collapse {
  width: 64px;
}
.el-menu--collapse > .el-menu-item [class^='el-icon-'],
.el-menu--collapse > .el-submenu > .el-submenu__title [class^='el-icon-'] {
  margin: 0;
  vertical-align: middle;
  width: 24px;
  text-align: center;
}
.el-menu--collapse > .el-menu-item .el-submenu__icon-arrow,
.el-menu--collapse > .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
  display: none;
}
.el-menu--collapse > .el-menu-item span,
.el-menu--collapse > .el-submenu > .el-submenu__title span {
  display: inline-block;
  overflow: hidden;
  width: 0;
  height: 0;
  visibility: hidden;
}
.el-menu--collapse > .el-menu-item.is-active i {
  color: inherit;
}
.el-menu--collapse .el-menu .el-submenu {
  min-width: 200px;
}
.el-menu--collapse .el-submenu {
  position: relative;
}
.el-menu--collapse .el-submenu .el-menu {
  position: absolute;
  top: 0;
  left: 100%;
  z-index: 10;
  margin-left: 5px;
  border: 1px solid #e4e7ed;
  border-radius: 2px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.el-menu--collapse .el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
  transform: none;
}
.el-menu--popup {
  z-index: 100;
  padding: 5px 0;
  min-width: 200px;
  border: none;
  border-radius: 2px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.el-menu-item,
.el-submenu__title {
  position: relative;
  padding: 0 20px;
  white-space: nowrap;
  list-style: none;
  line-height: 56px;
}
.el-menu--popup-bottom-start {
  margin-top: 5px;
}
.el-menu--popup-right-start {
  margin-right: 5px;
  margin-left: 5px;
}
.el-menu-item {
  height: 56px;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s, color 0.3s;
  box-sizing: border-box;
}
.el-menu-item * {
  vertical-align: middle;
}
.el-menu-item i {
  color: #909399;
}
.el-menu-item:focus,
.el-menu-item:hover {
  background-color: #ecf5ff;
  outline: 0;
}
.el-menu-item.is-disabled {
  background: 0 0 !important;
  opacity: 0.25;
  cursor: not-allowed;
}
.el-menu-item [class^='el-icon-'] {
  margin-right: 5px;
  width: 24px;
  font-size: 18px;
  text-align: center;
  vertical-align: middle;
}
.el-menu-item.is-active {
  color: #409eff;
}
.el-menu-item.is-active i {
  color: inherit;
}
.el-submenu {
  margin: 0;
  padding-left: 0;
  list-style: none;
}
.el-submenu__title {
  height: 56px;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s, color 0.3s;
  box-sizing: border-box;
}
.el-submenu__title * {
  vertical-align: middle;
}
.el-submenu__title i {
  color: #909399;
}
.el-submenu__title:focus,
.el-submenu__title:hover {
  background-color: #ecf5ff;
  outline: 0;
}
.el-submenu__title.is-disabled {
  background: 0 0 !important;
  opacity: 0.25;
  cursor: not-allowed;
}
.el-submenu__title:hover {
  background-color: #ecf5ff;
}
.el-submenu .el-menu {
  border: none;
}
.el-submenu .el-menu-item {
  padding: 0 45px;
  min-width: 200px;
  height: 50px;
  line-height: 50px;
}
.el-submenu__icon-arrow {
  position: absolute;
  top: 50%;
  right: 20px;
  margin-top: -7px;
  font-size: 12px;
  transition: transform 0.3s;
}
.el-submenu.is-active .el-submenu__title {
  border-bottom-color: #409eff;
}
.el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
  transform: rotateZ(180deg);
}
.el-submenu.is-disabled .el-menu-item,
.el-submenu.is-disabled .el-submenu__title {
  background: 0 0 !important;
  opacity: 0.25;
  cursor: not-allowed;
}
.el-submenu [class^='el-icon-'] {
  margin-right: 5px;
  width: 24px;
  font-size: 18px;
  text-align: center;
  vertical-align: middle;
}
.el-menu-item-group > ul {
  padding: 0;
}
.el-menu-item-group__title {
  padding: 7px 0 7px 20px;
  line-height: normal;
  font-size: 12px;
  color: #909399;
}
.horizontal-collapse-transition .el-submenu__title .el-submenu__icon-arrow {
  opacity: 0;
  transition: 0.2s;
}
</style>

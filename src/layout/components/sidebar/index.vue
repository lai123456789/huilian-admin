<script>
import PopupManager from 'element-ui/lib/utils/popup/popup-manager.js'
import { simulateMousedownEvent } from '@/utils'
import config from '@/config'
import SidebarMenu from './components/sidebar-menu'
import { mapGetters } from 'vuex'

export default {
  name: 'Sidebar',
  components: {
    SidebarMenu
  },
  data() {
    return {
      permissionRoutes: [],
      // 菜单收起状态下鼠标移入菜单时展开的状态
      isMouseenterExpand: false,
      showFont: false,
      showDrawer: false,
      isHover: void 0,
      isActive: void 0,
      isItemActive: void 0,
      sidebarStyle: {
        zIndex: PopupManager.nextZIndex()
      }
    }
  },
  computed: {
    ...mapGetters(['routes', 'menuMap'])
  },
  watch: {
    $route: {
      handler(route) {
        this.permissionRoutes = this.formatRoutes(this.routes)
        if (config.staticRouteWhites.includes(route.name)) {
          const target = this.permissionRoutes.find(v => v.meta.id === this.menuMap[decodeURI(route.path)].routeFirstId)
          this.isItemActive = target ? target.meta.id : void 0
          this.isActive = this.permissionRoutes.findIndex(v => v.meta.id === this.menuMap[decodeURI(route.path)].routeFirstId)
        } else {
          const target = this.permissionRoutes.find(v => v.meta.id === route.meta.routeFirstId)
          this.isItemActive = target ? target.meta.id : void 0
          this.isActive = this.permissionRoutes.findIndex(v => v.meta.id === route.meta.routeFirstId)
        }
        this.$nextTick(() => {
          if (this.isActive < 0) {
            this.isMouseenterExpand = true
            this.showFont = true
          } else {
            this.isMouseenterExpand = false
            this.showFont = false
            this.showDrawer = false
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    handleMouseenter() {
      this.sidebarStyle.zIndex = PopupManager.nextZIndex()
      if (this.isActive < 0) return
      this.isMouseenterExpand = true
      this.showFont = true
      simulateMousedownEvent()
    },
    handleMouseleave() {
      this.showDrawer = false
      if (this.isActive < 0) return
      this.isMouseenterExpand = false
      this.isHover = void 0
      this.showFont = false
    },
    handleItemMouseenter(_, route) {
      this.isHover = route.meta.id
      this.showDrawer = true
    },
    handlePlaceholderMouseenter() {
      this.isHover = void 0
      this.showDrawer = false
    },
    handleItemMousedown(_, route, index) {
      this.isActive = index
      this.isItemActive = route.meta.id
      this.handleMouseleave()
    },
    formatRoutes(data = []) {
      return data.filter(v => !v.hidden)
    }
  }
}
</script>

<template>
  <div :class="['sidebar', { 'is-mouseenter-expand': isMouseenterExpand }]">
    <div class="sidebar-container" :style="sidebarStyle">
      <div class="sidebar-body" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
        <el-scrollbar>
          <ul class="sidebar-items">
            <li
              v-for="(route, index) in permissionRoutes"
              :key="route.meta.id"
              :class="['sidebar-item', { 'is-hover': route.meta.id === isHover, 'is-active': index === isActive }]"
              @mouseenter.self="ev => handleItemMouseenter(ev, route)"
              @mousedown="ev => handleItemMousedown(ev, route, index)"
            >
              <div class="sidebar-item-left">
                <i :class="['sidebar-item-icon', 'scp-font', route.meta.icon]"></i>
                <div v-show="isMouseenterExpand && showFont" class="sidebar-item-title">{{ route.meta.title }}</div>
              </div>
              <i v-show="isMouseenterExpand && showFont" class="sidebar-item-right el-icon-arrow-right"></i>
            </li>
          </ul>
          <div class="sidebar-placeholder" @mouseenter.self="handlePlaceholderMouseenter"></div>
        </el-scrollbar>
        <div
          v-for="route in permissionRoutes"
          v-show="isMouseenterExpand && showDrawer && route.meta.id === isHover"
          :key="route.meta.id"
          class="sidebar-drawer"
        >
          <div class="sidebar-drawer-liner">
            <sidebar-menu :routes="route.children && route.children.length > 0 ? route.children : []" />
          </div>
        </div>
      </div>
    </div>
    <div v-for="route in permissionRoutes" v-show="route.meta.id === isItemActive" :key="route.meta.id" class="sidebar-menu">
      <sidebar-menu
        ref="sidebarMenuRef"
        class="sidebar-menu-liner"
        show-title
        :title="isItemActive ? route.meta.title : ''"
        :routes="route.children && route.children.length > 0 ? route.children : []"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -$--sidebar-width;
  width: 50px;
  height: 100%;
  font-size: 0;
  box-sizing: border-box;
  &.is-mouseenter-expand {
    width: $--sidebar-width !important;
  }
  &-container {
    position: relative;
    display: flex;
    height: 100%;
    background-color: #212542;
    box-shadow: 2px 0 6px rgb(0 21 41 / 35%);
    transition: none !important;
    flex-direction: column;
  }
  &-body {
    overflow: hidden;
    height: 0;
    flex: 1;
    ::v-deep .scrollbar-wrap {
      overflow-x: hidden;
      overflow-y: scroll;
      .el-scrollbar__view {
        display: flex;
        height: 100%;
        flex-direction: column;
      }
    }
  }
  &-items {
    padding-top: 10px;
  }
  &-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 7px;
    padding: 0 15px;
    height: 32px;
    cursor: pointer;
    &-left {
      display: flex;
      align-items: center;
    }
    &-right {
      font-size: 12px;
      color: #ffffff;
    }
    &-icon {
      display: inline-block;
      padding: 8px 0;
      font-size: 14px;
      color: #ffffff;
    }
    &-title {
      padding-left: 15px;
      font-size: 13px;
      color: #ffffff;
    }
    &.is-hover {
      background-color: #2e3469;
    }
    &.is-active {
      background-color: #2e3469;
    }
  }
  &-placeholder {
    flex: 1;
  }
  &-drawer {
    position: absolute;
    top: 0;
    left: $--sidebar-width;
    padding-left: 5px;
    width: $--sidebar-width;
    height: 100%;
    background: #ffffff;
    &-liner {
      height: 100%;
      border: 1px solid #e4e7ec;
    }
  }
  &-menu {
    position: absolute;
    top: 0;
    left: 50px;
    display: flex;
    width: 160px;
    height: 100%;
    flex-direction: column;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 1px 4px 0 rgb(0 0 0 / 4%);
    &-title {
      padding: 10px 0 10px 10px;
      font-size: 14px;
      font-weight: 700;
      border-bottom: 1px solid #e4e7ec;
    }
    &-liner {
      flex: 1;
      height: 0;
    }
  }
}
</style>

<script>
import { mapGetters } from 'vuex'
import Sidebar from './components/sidebar'
import variables from '@/styles/variables.scss'
import config from '@/config'

export default {
  components: { Sidebar },
  computed: {
    ...mapGetters(['routes', 'sidebar', 'menuMap']),
    defaultActive() {
      if (config.staticRouteWhites.includes(this.$route.name)) {
        return this.menuMap[decodeURI(this.$route.path)].id
      } else {
        return this.$route.meta.id
      }
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>

<template>
  <div :class="['sidebar-usual', { 'is-sidebar-usual-collapse': isCollapse }]">
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <base-menu
        :default-active="defaultActive"
        :collapse="isCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        :text-color="variables.menuText"
        :background-color="variables.menuBg"
        :active-text-color="variables.menuActiveText"
        mode="vertical"
      >
        <sidebar
          v-for="(route, index) in routes"
          :key="route.meta ? route.meta.id : `${route.path}_${index}`"
          :item="route"
          :base-path="route.path"
        />
      </base-menu>
    </el-scrollbar>
  </div>
</template>

<style lang="scss">
.sidebar-usual {
  position: absolute;
  top: 0;
  left: -$--sidebar-width;
  width: $--sidebar-width;
  height: 100%;
  background-color: $--menu-bg;
  &.is-sidebar-usual-collapse {
    left: -80px;
    width: 80px;
    .el-submenu__title {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px 0;
      padding: 0 10px;
      font-size: 12px;
      flex-direction: column;
      line-height: inherit;
      & > i {
        display: inline-block;
        margin: 0;
        margin-bottom: 2px;
        font-size: 20px;
      }
      .el-submenu__icon-arrow {
        display: none;
      }
    }
  }
  .el-scrollbar {
    height: 100%;
    .scrollbar-wrapper {
      overflow-x: hidden !important;
    }
  }
  .el-menu {
    height: 100%;
    border: none;
  }
  .el-submenu .el-menu-item,
  .nest-menu .el-submenu > .el-submenu__title {
    background-color: #000000 !important;
  }
  .el-menu-item {
    transition: none;
    .sub-el-icon,
    .svg-icon,
    .scp-font {
      display: none;
    }
    &.is-active {
      background-color: var(--color-primary) !important;
    }
  }
  .el-submenu.is-active {
    > .el-submenu__title {
      color: #ffffff !important;
    }
    .el-submenu__icon-arrow,
    .scp-font {
      color: #ffffff !important;
    }
  }
  .el-menu--collapse {
    width: 100% !important;
  }
  .sub-el-icon,
  .svg-icon,
  .scp-font {
    display: inline-block;
    margin-right: 15px;
    margin-right: 8px;
    font-size: 18px;
  }
  &-popper {
    .sub-el-icon,
    .svg-icon,
    .scp-font {
      display: inline-block;
      margin-right: 15px;
      margin-right: 8px;
      font-size: 18px;
    }
    .el-menu-item {
      transition: none;
      .sub-el-icon,
      .svg-icon,
      .scp-font {
        display: none;
      }
      &.is-active {
        background-color: var(--color-primary) !important;
      }
    }
    .el-submenu.is-active {
      > .el-submenu__title {
        color: #ffffff !important;
      }
      .el-submenu__icon-arrow,
      .scp-font {
        color: #ffffff !important;
      }
    }
  }
}
.el-menu--vertical > .el-menu--popup {
  overflow-y: auto;
  max-height: 100vh;
}
</style>

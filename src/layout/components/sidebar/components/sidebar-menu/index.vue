<script>
import SidebarItem from './sidebar'
import config from '@/config'
import { mapGetters } from 'vuex'

export default {
  name: 'Menu',
  components: { SidebarItem },
  props: {
    showTitle: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    routes: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['menuMap']),
    defaultActive() {
      if (config.staticRouteWhites.includes(this.$route.name)) {
        return this.menuMap[decodeURI(this.$route.path)].id
      } else {
        return this.$route.meta.id
      }
    },
    defaultOpeneds() {
      // TODO 默认只展开第一级
      return this.routes.map(v => v.meta.id)
    }
  }
}
</script>

<template>
  <div class="menu">
    <div v-if="showTitle" class="menu-header">
      {{ title }}
    </div>
    <div class="menu-body">
      <el-scrollbar wrap-class="menu-body-scrollbar-wrap">
        <base-menu
          mode="vertical"
          :default-openeds="defaultOpeneds"
          :default-active="defaultActive"
          :unique-opened="false"
          :collapse-transition="false"
        >
          <sidebar-item v-for="route in routes" :key="route.meta.id" :item="route" :base-path="route.path" />
        </base-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  &-header {
    padding-left: 28px;
    height: 50px;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 1px solid #dcdfe6;
    color: #17233d;
    line-height: 50px;
  }
  &-body {
    flex: 1;
    height: 0;
    ::v-deep .el-submenu {
      .el-submenu__title {
        display: flex;
        align-items: center;
        padding-right: 0;
        height: 40px;
        font-size: 12px;
        line-height: 40px;
      }
      .is-exterior {
        .el-menu-item {
          &.is-active {
            color: #606266;
            background-color: transparent;
            &::before {
              background-color: transparent;
            }
          }
        }
      }
      .el-submenu__icon-arrow.el-icon-arrow-down {
        display: none;
      }
      .menu-item-hand {
        margin-top: -1px;
        margin-right: 3px;
        font-size: 14px;
        transition: transform 0.3s ease 0s;
      }
      &.is-opened > .el-submenu__title .menu-item-hand {
        transform: rotate(90deg);
      }
    }
    ::v-deep .el-menu-item {
      padding: 5px 0;
      min-width: auto;
      height: 40px;
      font-size: 12px;
      line-height: 30px;
      color: #606266;
      transition: none;
      > span {
        padding-left: 7px;
      }
      &:focus {
        background-color: transparent;
      }
      &.is-active {
        color: var(--color-primary);
        background-color: var(--color-light-primary);
        outline: 0;
        &::before {
          position: absolute;
          top: 0;
          right: 0;
          width: 3px;
          height: 40px;
          background-color: #222640;
          content: '';
        }
      }
    }
    ::v-deep .el-scrollbar {
      height: 100%;
    }
    ::v-deep &-scrollbar-wrap {
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }
}
</style>

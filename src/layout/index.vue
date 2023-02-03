<script>
import {
  AppMain,
  Navbar,
  Sidebar,
  // SidebarUsual,
  TagsView
} from './components'
import { mapGetters } from 'vuex'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    Sidebar,
    // SidebarUsual,
    TagsView
  },
  computed: {
    ...mapGetters(['sidebar']),
    isCollapse() {
      return !this.sidebar.opened
      // return true
    }
  },
  created() {
    this.$store.dispatch('user/openRefreshToken')
  },
  beforeDestroy() {
    this.$store.dispatch('user/resetRefreshTokenState')
  }
}
</script>

<template>
  <div class="app-container">
    <navbar />
    <div :class="['main-container', { 'is-collapse': isCollapse }]">
      <!-- <sidebar-usual /> -->
      <sidebar />
      <tags-view />
      <div class="main-wrap">
        <app-main />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-container {
  @include clearfix;

  position: relative;
  width: 100%;
  min-width: 1360px;
  height: 100%;
  .main-container {
    position: relative;
    margin-left: $--sidebar-width;
    height: calc(100% - 50px);
    .main-wrap {
      padding: 10px;
      height: calc(100% - 34px);
      background-color: #f3f3f3;
      box-sizing: border-box;
    }
    &.is-collapse {
      margin-left: 80px;
    }
  }
}
</style>

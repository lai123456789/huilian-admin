<script>
import Avatar from './components/avatar'
import Logo from './components/logo'
import HeaderSearch from './components/search'
// import Notification from './components/notification'
// import Setting from './components/setting'

export default {
  name: 'Navbar',
  components: {
    // Setting,
    // Notification,
    Avatar,
    Logo,
    HeaderSearch
  }
}
</script>

<template>
  <div class="navbar">
    <div class="navbar-logo">
      <logo></logo>
    </div>
    <div class="navbar-tools">
      <div class="navbar-buttons">
        <header-search class="navbar-item" />
        <!-- <notification class="navbar-item" /> -->
        <!-- <setting class="navbar-item" /> -->
      </div>
      <avatar />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  height: 50px;
  border-bottom: 1px solid $--color-border;
  background: #ffffff;
  &-logo {
    height: 100%;
  }
  &-tools {
    display: flex;
    align-items: center;
    padding: 0 20px;
    white-space: nowrap;
    &:focus {
      outline: none;
    }
    .navbar-item {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-width: 34px;
      height: 26px;
      cursor: pointer;
      vertical-align: middle;
    }
  }
  &-buttons {
    margin-right: 15px;
  }
}
</style>

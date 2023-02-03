<script>
import IframePage from './components/iframe'
export default {
  name: 'AppMain',
  components: { IframePage },
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<template>
  <div class="app-main">
    <base-keep-alive class="app-main-pages" :include="cachedViews">
      <router-view :key="key" />
    </base-keep-alive>
    <iframe-page />
  </div>
</template>

<style lang="scss" scoped>
.app-main {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 1px 4px 0 rgb(0 0 0 / 4%);
  &-pages {
    height: 100%;
  }
}
</style>

<!-- 此组件只能包含iframe, 不能写自身的一些组件 -->

<script>
export default {
  name: 'IframePage',
  data() {
    return {
      componentsArr: []
    }
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    }
  },
  watch: {
    $route() {
      this.getComponentsArr()
    }
  },
  mounted() {
    this.getComponentsArr()
    this.$eventBus.$on('closeView', view => {
      const index = this.componentsArr.findIndex(v => view.name === v.name)
      if (index >= 0) {
        this.componentsArr.splice(index, 1)
      }
    })
  },
  methods: {
    /* 遍历路由的所有页面，把含有iframe标识的收集起来 */
    getComponentsArr() {
      const views = []
      this.visitedViews.forEach(view => {
        if (view.meta.iframe) {
          views.push(view)
        }
      })
      this.componentsArr = views
    },
    showCurrentPage(path) {
      return decodeURI(this.$route.path) === path
    }
  }
}
</script>

<template>
  <div class="iframe-page">
    <!-- customComponent这个字段指定自定义组件路径 -->
    <template v-for="item in componentsArr">
      <component
        :is="item.meta.customComponent"
        v-if="item.meta.customComponent"
        :key="`${item.meta.id}`"
        :style="{
          width: showCurrentPage(item.path) ? '100%' : 0,
          height: showCurrentPage(item.path) ? '100%' : 0
        }"
        :name="item.name"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.iframe-page {
  width: 100%;
  height: 100%;
}
</style>

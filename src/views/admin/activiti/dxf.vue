<script>
export default {
  name: 'Iframe',
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      url: '',
      loading: true
    }
  },
  mounted() {
    this.handleLoad()
    this.$eventBus.$on('refreshView', view => {
      if (this.name === view.name) {
        this.url = ''
        setTimeout(() => {
          this.handleLoad()
        }, 0)
      }
    })
  },
  /* 组件销毁时解除事件绑定 */
  beforeDestroy() {
    this.$eventBus.$off('refreshView')
  },
  methods: {
    handleLoad() {
      const { id } = this.$route.params
      this.url = `${window.location.origin}/act/modeler.html?modelId=${id}`
      this.loading = true
      const { iframe } = this.$refs
      // IE和非IE浏览器，监听iframe加载事件不一样，需要兼容
      const that = this
      if (iframe.attachEvent) {
        // IE
        iframe.attachEvent('onload', () => {
          that.stateChange()
        })
      } else {
        // 非IE
        iframe.onload = function () {
          that.stateChange()
        }
      }
    },
    stateChange() {
      this.loading = false
    }
  }
}
</script>

<template>
  <!-- 模型图 -->
  <div
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    class="iframe"
  >
    <!-- 如果是内嵌iframe的页面，都要经过这个公共组件 -->
    <iframe ref="iframe" :src="url" width="100%" height="100%" frameborder="0"></iframe>
  </div>
</template>

<style lang="scss" scoped>
.iframe {
  width: 100%;
  height: 100%;
}
</style>

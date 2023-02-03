<script>
import { getStorage } from '@/utils/storage'
import constant from '@/constant'

export default {
  name: 'UreportIframe',
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
      const { params } = this.$route

      const payload = [`access_token=${getStorage({ name: constant.STORAGE_ACCESS_TOKEN })}`]

      if (params) {
        for (const key in params) {
          if (Object.hasOwnProperty.call(params, key) && key !== 'id') {
            const item = params[key]
            payload.push(`${key}=${item[key]}`)
          }
        }
      }

      this.url = `/ureport/preview?_u=${params.id}&${payload.join('&')}`
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
  <!-- ureport报表 -->
  <div
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    class="iframe"
  >
    <iframe ref="iframe" :src="url" width="100%" height="100%" frameborder="0"></iframe>
  </div>
</template>

<style lang="scss" scoped>
.iframe {
  width: 100%;
  height: 100%;
}
</style>

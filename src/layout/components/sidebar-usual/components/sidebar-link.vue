<template>
  <div @click="handleLink(to, route)">
    <slot />
  </div>
</template>

<script>
import { isExternal } from '@/utils'
import enums from '@/enums'

export default {
  props: {
    to: {
      type: String,
      default: ''
    },
    route: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    handleLink(path, route) {
      if (route.meta.openMode === enums.OPEN_MODE.getFieldByKey('EXTERNAL')) {
        if (isExternal(path)) {
          window.open(path)
        } else {
          window.open(`/#${path}`)
        }
      } else {
        this.$router.push(path)
      }
    }
  }
}
</script>

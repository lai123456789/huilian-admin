<script>
export default {
  name: 'Notification',
  data() {
    return {}
  },
  methods: {}
}
</script>

<template>
  <div class="notification">
    <el-popover placement="bottom" width="400" trigger="hover">
      <div>1223</div>
      <el-badge slot="reference" :value="100" :hidden="false" :max="99">
        <base-svg-icon icon-class="notification" title="消息" />
      </el-badge>
    </el-popover>
  </div>
</template>

<style lang="scss">
.notification {
  .el-badge__content {
    &.is-fixed {
      top: 2px;
      right: 13px;
      padding: 0 3px;
    }
  }
}
</style>

<script>
export default {
  name: 'BaseTimePicker',
  props: {
    type: {
      type: String,
      default: 'timePicker'
    }
  },
  methods: {
    focus() {
      this.$refs.timePickerRef.focus()
    }
  }
}
</script>

<template>
  <div class="base-time-picker">
    <el-time-picker v-if="type === 'timePicker'" ref="timePickerRef" v-bind="$attrs" v-on="$listeners" />
    <el-time-select v-else ref="timePickerRef" v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<style lang="scss">
.base-time-picker {
  width: 100%;
  .el-date-editor {
    width: 100% !important;
  }
}
</style>

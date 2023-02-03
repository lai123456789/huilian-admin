<script>
export default {
  name: 'BaseSwitch',
  props: {
    /* 在内部显示文本，需要提供一个width */
    inline: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classes() {
      return [
        'base-switch',
        {
          'base-switch-inline': this.inline
        }
      ]
    }
  },
  methods: {
    focus() {
      this.$refs.switchRef.focus()
    }
  }
}
</script>

<template>
  <el-switch ref="switchRef" :class="classes" v-bind="$attrs" v-on="$listeners"> </el-switch>
</template>

<style lang="scss">
.base-switch {
  &-inline {
    .el-switch__label {
      position: absolute;
      display: none;
      color: #ffffff !important;
    }

    /* 打开时文字位置设置 */
    .el-switch__label--right {
      z-index: 1;
    }

    /* 调整打开时文字的显示位子 */
    .el-switch__label--right span {
      margin-right: 9px;
      font-size: 12px;
      user-select: none;
    }

    /* 关闭时文字位置设置 */
    .el-switch__label--left {
      z-index: 1;
    }

    /* 调整关闭时文字的显示位子 */
    .el-switch__label--left span {
      margin-left: 21px;
      font-size: 12px;
      user-select: none;
    }

    /* 显示文字 */
    .el-switch__label.is-active {
      display: block;
    }
  }
}
</style>

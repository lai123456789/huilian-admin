<script>
export default {
  name: 'BaseFormItem',
  provide() {
    return {
      baseFormItem: this
    }
  },
  inject: ['baseForm'],
  methods: {
    resetField() {
      this.$refs.formItemRef.resetField()
    },
    clearValidate() {
      this.$refs.formItemRef.clearValidate()
    }
  }
}
</script>

<template>
  <el-form-item ref="formItemRef" class="base-form-item" v-bind="$attrs">
    <slot></slot>
    <template #label>
      <slot name="label"></slot>
    </template>
    <template #error="{ error }">
      <slot name="error" :error="error"></slot>
    </template>
  </el-form-item>
</template>

<style lang="scss">
.base-form-item {
  display: flex;
  align-items: center;
  &.el-form-item.el-form-item--mini {
    margin-bottom: 11px;
    .el-form-item__label {
      padding-right: 4px;
      font-size: 12px;
      line-height: normal;
    }
    .el-form-item__content {
      line-height: inherit;
      flex: 1;
      margin-left: 0 !important;
    }
  }
}
</style>

<script>
export default {
  name: 'BaseForm',
  provide() {
    return {
      baseForm: this
    }
  },
  props: {
    showMessage: {
      type: Boolean,
      default: true
    },
    labelSuffix: {
      type: String,
      default: '：'
    }
  },
  methods: {
    // 通过 el-message 的形式展示错误信息
    useErrorByMessage(invalidFields) {
      if (this.showMessage) {
        const errMsg = Object.values(invalidFields)[0][0]
        this.$message.error(errMsg.message)
      }
    },
    validate(...props) {
      return this.$refs.formRef.validate(...props)
    },
    validateField(...props) {
      this.$refs.formRef.validateField(...props)
    },
    resetFields() {
      this.$refs.formRef.resetFields()
    },
    clearValidate(...props) {
      this.$refs.formRef.clearValidate(...props)
    }
  }
}
</script>

<template>
  <el-form ref="formRef" class="base-form" :label-suffix="labelSuffix" v-bind="$attrs" :show-message="false" v-on="$listeners">
    <slot></slot>
  </el-form>
</template>

<style lang="scss">
.base-form {
  .el-col {
    display: inline-block;
    float: none;
    padding-right: 5px !important;
    padding-left: 5px !important;
    vertical-align: top;
  }
}
</style>

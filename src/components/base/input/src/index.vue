<script>
import { addResizeListener, removeResizeListener } from 'element-ui/lib/utils/resize-event'
export default {
  name: 'BaseInput',
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    disabled: Boolean,
    placeholder: String,
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showTooltip: true
    }
  },
  computed: {
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    }
  },
  mounted() {
    addResizeListener(this.$el, this.handleResize)
  },
  beforeDestroy() {
    if (this.$el && this.handleResize) {
      removeResizeListener(this.$el, this.handleResize)
    }
  },
  methods: {
    focus() {
      this.$refs.inputRef.focus()
    },
    blur() {
      this.$refs.inputRef.blur()
    },
    select() {
      this.$refs.inputRef.select()
    },
    handleResize() {
      this.handleInputExceeds()
    },
    // 判断input内容是否超出
    handleInputExceeds() {
      const input = this.$refs.inputRef.getInput()

      // 禁用状态下才显示 tooltip
      if (this.inputDisabled) {
        this.showTooltip = !(input.offsetWidth < input.scrollWidth - 1)
      }
    }
  }
}
</script>

<template>
  <el-tooltip placement="top" :content="String($attrs.value)" :disabled="!$attrs.value || showTooltip">
    <el-input
      ref="inputRef"
      v-bind="$attrs"
      :disabled="inputDisabled"
      :placeholder="inputDisabled ? '' : placeholder"
      :clearable="clearable"
      v-on="$listeners"
    >
      <template #prefix>
        <slot name="prefix" />
      </template>
      <template #suffix>
        <slot name="suffix" />
      </template>
      <template #prepend>
        <slot name="prepend" />
      </template>
      <template #append>
        <slot name="append" />
      </template>
    </el-input>
  </el-tooltip>
</template>

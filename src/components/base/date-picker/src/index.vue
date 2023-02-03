<script>
export default {
  name: 'BaseDatePicker',
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
    startPlaceholder: String,
    endPlaceholder: String,
    type: {
      type: String,
      default: 'date'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    format: {
      type: String,
      default: 'yyyy-MM-dd'
    },
    valueFormat: {
      type: String,
      default: 'yyyy-MM-dd'
    }
  },
  computed: {
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    }
  },
  methods: {
    focus() {
      this.$refs.datePickerRef.focus()
    }
  }
}
</script>

<template>
  <el-date-picker
    ref="datePickerRef"
    style="width: 100%"
    v-bind="$attrs"
    :disabled="inputDisabled"
    :placeholder="inputDisabled ? '' : placeholder"
    :start-placeholder="inputDisabled ? '' : startPlaceholder"
    :end-placeholder="inputDisabled ? '' : endPlaceholder"
    :type="type"
    :clearable="clearable"
    :value-format="valueFormat"
    :format="format"
    v-on="$listeners"
  />
</template>

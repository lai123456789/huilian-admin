<script>
import { clone } from 'xe-utils'
const DEFAULT_OPTIONS_CONFIG = {
  groupField: 'options',
  groupKey: 'label',
  key: 'value',
  valueKey: 'value',
  labelKey: 'label'
}

export default {
  name: 'BaseSelect',
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
    options: {
      type: Array,
      default: () => []
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    optionsConfig: {
      type: Object,
      default: () => ({})
    },
    clearable: {
      type: Boolean,
      default: true
    },
    remoteMethod: Function
  },
  data() {
    return {
      defaultOptionsConfig: clone(DEFAULT_OPTIONS_CONFIG, true),
      remoteMethodOptions: []
    }
  },
  computed: {
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    },
    rewriteOptions() {
      return this.remoteMethod ? this.remoteMethodOptions || this.options : this.options
    }
  },
  methods: {
    focus() {
      this.$refs.selectRef.focus()
    },
    blur() {
      this.$refs.selectRef.blur()
    },
    /** 重写remoteMethod方法，为了兼容编辑表格里面使用*/
    rewriteRemoteMethod(query) {
      if (this.remoteMethod) {
        this.remoteMethod(query, options => {
          this.remoteMethodOptions = options
        })
      }
    }
  }
}
</script>

<template>
  <el-select
    ref="selectRef"
    style="width: 100%"
    v-bind="$attrs"
    :disabled="inputDisabled"
    :placeholder="inputDisabled ? '' : placeholder"
    :clearable="clearable"
    :remote-method="rewriteRemoteMethod"
    v-on="$listeners"
  >
    <template v-if="isGroup">
      <el-option-group
        v-for="group in rewriteOptions"
        :key="group[optionsConfig.groupKey || defaultOptionsConfig.groupKey]"
        :label="group.label"
        :disabled="group.disabled"
      >
        <el-option
          v-for="item in group[optionsConfig.groupField || defaultOptionsConfig.groupField]"
          :key="item[optionsConfig.key || defaultOptionsConfig.key]"
          :label="item[optionsConfig.labelKey || defaultOptionsConfig.labelKey]"
          :value="item[optionsConfig.valueKey || defaultOptionsConfig.valueKey]"
          :disabled="item.disabled"
        >
        </el-option>
      </el-option-group>
    </template>
    <template v-else>
      <el-option
        v-for="item in rewriteOptions"
        :key="item[optionsConfig.key || defaultOptionsConfig.key]"
        :label="item[optionsConfig.labelKey || defaultOptionsConfig.labelKey]"
        :value="item[optionsConfig.valueKey || defaultOptionsConfig.valueKey]"
        :disabled="item.disabled"
      >
      </el-option>
    </template>
    <slot />
    <template #prefix>
      <slot name="prefix" />
    </template>
    <template #empty>
      <slot name="empty" />
    </template>
  </el-select>
</template>

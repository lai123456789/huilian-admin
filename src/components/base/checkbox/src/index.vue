<script>
import { clone } from 'xe-utils'
const DEFAULT_OPTIONS_CONFIG = {
  valueKey: 'value',
  labelKey: 'label'
}

export default {
  name: 'BaseCheckbox',
  props: {
    isGroup: {
      type: Boolean,
      default: false
    },
    isbutton: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array,
      default: () => []
    },
    optionsConfig: {
      type: Object,
      default: () => ({})
    },
    value: [String, Number, Boolean, Array],
    label: [String, Number, Boolean, Object],
    title: [String, Number],
    indeterminate: Boolean,
    disabled: Boolean,
    checked: Boolean,
    name: String,
    trueLabel: [String, Number],
    falseLabel: [String, Number],
    border: Boolean,
    size: String,
    groupSize: String,
    groupDisabled: Boolean,
    groupMin: Number,
    groupMax: Number,
    groupFill: String,
    groupTextColor: String
  },
  data() {
    return {
      defaultOptionsConfig: clone(DEFAULT_OPTIONS_CONFIG, true)
    }
  },
  computed: {
    checkboxProps() {
      return {
        label: this.label,
        indeterminate: this.indeterminate,
        disabled: this.disabled,
        checked: this.checked,
        name: this.name,
        trueLabel: this.trueLabel,
        falseLabel: this.falseLabel,
        border: this.border,
        size: this.size
      }
    },
    checkboxGroupProps() {
      return {
        size: this.groupSize,
        disabled: this.groupDisabled,
        min: this.groupMin,
        max: this.groupMax,
        fill: this.groupFill,
        textColor: this.groupTextColor
      }
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('change', val)
    },
    handleGroupChange(val) {
      this.$emit('group-change', val)
    },
    handleInput(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<template>
  <el-checkbox-group v-if="isGroup" :value="value" v-bind="checkboxGroupProps" @change="handleGroupChange" @input="handleInput">
    <slot>
      <el-checkbox
        v-for="(item, index) in options"
        :key="item.key || index"
        v-bind="item"
        :label="item[optionsConfig.valueKey || defaultOptionsConfig.valueKey]"
        @change="handleChange"
        >{{ item[optionsConfig.labelKey || defaultOptionsConfig.labelKey] }}</el-checkbox
      >
    </slot>
  </el-checkbox-group>
  <el-checkbox-group v-else-if="isbutton" :value="value" v-bind="checkboxGroupProps" @change="handleGroupChange" @input="handleInput">
    <slot>
      <el-checkbox-button
        v-for="(item, index) in options"
        :key="item.key || index"
        v-bind="item"
        :label="item[optionsConfig.valueKey || defaultOptionsConfig.valueKey]"
        >{{ item[optionsConfig.labelKey || defaultOptionsConfig.labelKey] }}</el-checkbox-button
      >
    </slot>
  </el-checkbox-group>
  <el-checkbox v-else :value="value" v-bind="checkboxProps" @change="handleChange" @input="handleInput">
    <slot>
      {{ title }}
    </slot>
  </el-checkbox>
</template>

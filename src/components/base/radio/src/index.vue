<script>
import { clone } from 'xe-utils'
const DEFAULT_OPTIONS_CONFIG = {
  valueKey: 'value',
  labelKey: 'label'
}

export default {
  name: 'BaseRadio',

  inject: {
    elForm: {
      default: ''
    },

    elFormItem: {
      default: ''
    }
  },

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
    value: [String, Number, Boolean],
    label: [String, Number, Boolean, Object],
    title: [String, Number],
    disabled: Boolean,
    name: String,
    border: Boolean,
    size: String,
    groupSize: String,
    groupDisabled: Boolean,
    groupFill: String,
    groupTextColor: String
  },
  data() {
    return {
      defaultOptionsConfig: clone(DEFAULT_OPTIONS_CONFIG, true)
    }
  },
  computed: {
    elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    radioSize() {
      return !this.border ? this.size || this.elFormItemSize || (this.$ELEMENT || {}).size : false
    },
    radioProps() {
      return {
        label: this.label,
        disabled: this.disabled,
        name: this.name,
        border: this.border,
        size: this.radioSize
      }
    },
    radioGroupProps() {
      return {
        size: this.groupSize,
        disabled: this.groupDisabled,
        fill: this.groupFill,
        textColor: this.groupTextColor
      }
    }
  },
  methods: {
    radioItemSize(item) {
      return !item.border ? item.size || this.elFormItemSize || (this.$ELEMENT || {}).size : false
    },
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
  <el-radio-group v-if="isGroup" :value="value" v-bind="radioGroupProps" @change="handleGroupChange" @input="handleInput">
    <slot>
      <el-radio
        v-for="(item, index) in options"
        :key="item.key || index"
        v-bind="item"
        :class="`${radioItemSize(item) ? 'base-radio-size-' + radioItemSize(item) : ''}`"
        :label="item[optionsConfig.valueKey || defaultOptionsConfig.valueKey]"
        @change="handleChange"
        >{{ item[optionsConfig.labelKey || defaultOptionsConfig.labelKey] }}
      </el-radio>
    </slot>
  </el-radio-group>
  <el-radio-group v-else-if="isbutton" :value="value" v-bind="radioGroupProps" @change="handleGroupChange" @input="handleInput">
    <slot>
      <el-radio-button
        v-for="(item, index) in options"
        :key="item.key || index"
        v-bind="item"
        :label="item[optionsConfig.valueKey || defaultOptionsConfig.valueKey]"
      >
        {{ item[optionsConfig.labelKey || defaultOptionsConfig.labelKey] }}
      </el-radio-button>
    </slot>
  </el-radio-group>
  <el-radio
    v-else
    :value="value"
    v-bind="radioProps"
    :class="`${radioSize ? 'base-radio-size-' + radioSize : ''}`"
    @change="handleChange"
    @input="handleInput"
  >
    <slot>
      {{ title }}
    </slot>
  </el-radio>
</template>

<style lang="scss">
.base-radio-size {
  &-mini {
    .el-radio__label {
      font-size: 12px;
    }
  }
  &-small {
    .el-radio__label {
      font-size: 13px;
    }
  }
  &-medium {
    .el-radio__label {
      font-size: 14px;
    }
  }
}
</style>

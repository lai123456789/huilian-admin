<script>
import RepeatClick from 'element-ui/lib/directives/repeat-click'

export default {
  name: 'BaseInputNumber',
  directives: {
    repeatClick: RepeatClick
  },
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    step: {
      type: Number,
      default: 1
    },
    stepStrictly: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: -Infinity
    },
    value: [Number, String],
    disabled: Boolean,
    readonly: Boolean,
    size: String,
    controls: {
      type: Boolean,
      default: false
    },
    controlsPosition: {
      type: String,
      default: ''
    },
    align: {
      type: String,
      default: 'left'
    },
    name: String,
    label: String,
    placeholder: String,
    precision: {
      type: Number,
      validator(val) {
        return val >= 0 && val === parseInt(val, 10)
      }
    }
  },
  data() {
    return {
      currentValue: 0,
      userInput: null
    }
  },
  computed: {
    minDisabled() {
      return this._decrease(this.value, this.step) < this.min
    },
    maxDisabled() {
      return this._increase(this.value, this.step) > this.max
    },
    numPrecision() {
      const { value, step, getPrecision, precision } = this
      const stepPrecision = getPrecision(step)
      if (precision !== undefined) {
        if (stepPrecision > precision) {
          console.warn('[Warn][BaseInputNumber]precision should not be less than the decimal places of step')
        }
        return precision
      } else {
        return Math.max(getPrecision(value), stepPrecision)
      }
    },
    controlsAtRight() {
      return this.controls && this.controlsPosition === 'right'
    },
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    inputNumberSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
    },
    inputNumberDisabled() {
      return this.disabled || !!(this.elForm || {}).disabled
    },
    displayValue() {
      if (this.userInput !== null) {
        return this.userInput
      }

      let currentValue = this.currentValue

      if (typeof currentValue === 'number') {
        if (this.stepStrictly) {
          const stepPrecision = this.getPrecision(this.step)
          const precisionFactor = Math.pow(10, stepPrecision)
          currentValue = (Math.round(currentValue / this.step) * precisionFactor * this.step) / precisionFactor
        }

        if (this.precision !== undefined) {
          // 去掉小数点后面多余的0
          currentValue = parseFloat(currentValue.toFixed(this.precision))
        }
      }

      return currentValue
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        let newVal = value === undefined ? value : Number(value)
        if (newVal !== undefined) {
          if (isNaN(newVal)) {
            return
          }

          if (this.stepStrictly) {
            const stepPrecision = this.getPrecision(this.step)
            const precisionFactor = Math.pow(10, stepPrecision)
            newVal = (Math.round(newVal / this.step) * precisionFactor * this.step) / precisionFactor
          }

          if (this.precision !== undefined) {
            newVal = this.toPrecision(newVal, this.precision)
          }
        }
        if (newVal >= this.max) newVal = this.max
        if (newVal <= this.min) newVal = this.min
        this.currentValue = newVal
        this.userInput = null
      }
    }
  },
  mounted() {
    const innerInput = this.$refs.inputRef.$refs.input
    innerInput.setAttribute('role', 'spinbutton')
    innerInput.setAttribute('aria-valuemax', this.max)
    innerInput.setAttribute('aria-valuemin', this.min)
    innerInput.setAttribute('aria-valuenow', this.currentValue)
    innerInput.setAttribute('aria-disabled', this.inputNumberDisabled)
  },
  updated() {
    if (!this.$refs || !this.$refs.inputRef) return
    const innerInput = this.$refs.inputRef.$refs.input
    innerInput.setAttribute('aria-valuenow', this.currentValue)
  },
  methods: {
    focus() {
      this.$refs.inputRef.focus()
    },
    toPrecision(num, precision) {
      if (precision === undefined) precision = this.numPrecision
      return parseFloat(String(Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision)))
    },
    getPrecision(value) {
      if (value === undefined) return 0
      const valueString = value.toString()
      const dotPosition = valueString.indexOf('.')
      let precision = 0
      if (dotPosition !== -1) {
        precision = valueString.length - dotPosition - 1
      }
      return precision
    },
    _increase(val, step) {
      if (typeof val !== 'number' && val !== undefined) return this.currentValue

      const precisionFactor = Math.pow(10, this.numPrecision)
      // Solve the accuracy problem of JS decimal calculation by converting the value to integer.
      return this.toPrecision((precisionFactor * val + precisionFactor * step) / precisionFactor)
    },
    _decrease(val, step) {
      if (typeof val !== 'number' && val !== undefined) return this.currentValue

      const precisionFactor = Math.pow(10, this.numPrecision)

      return this.toPrecision((precisionFactor * val - precisionFactor * step) / precisionFactor)
    },
    increase() {
      if (this.inputNumberDisabled || this.maxDisabled) return
      const value = this.value || 0
      const newVal = this._increase(value, this.step)
      this.setCurrentValue(newVal)
    },
    decrease() {
      if (this.inputNumberDisabled || this.minDisabled) return
      const value = this.value || 0
      const newVal = this._decrease(value, this.step)
      this.setCurrentValue(newVal)
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    setCurrentValue(newVal) {
      const oldVal = this.currentValue
      if (typeof newVal === 'number' && this.precision !== undefined) {
        newVal = this.toPrecision(newVal, this.precision)
      }
      if (newVal >= this.max) newVal = this.max
      if (newVal <= this.min) newVal = this.min
      if (oldVal === newVal) return
      this.userInput = null
      this.$emit('input', newVal)
      this.$emit('change', newVal, oldVal)
      this.currentValue = newVal
    },
    handleInput(value) {
      this.userInput = value
    },
    handleInputChange(value) {
      const newVal = value === '' ? undefined : Number(value)
      if (!isNaN(newVal) || value === '') {
        this.setCurrentValue(newVal)
      }
      this.userInput = null
    },
    select() {
      this.$refs.inputRef.select()
    }
  }
}
</script>

<template>
  <div
    :class="[
      'base-input-number',
      `align-${align}`,
      inputNumberSize ? 'base-input-number--' + inputNumberSize : '',
      { 'is-disabled': inputNumberDisabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controlsAtRight }
    ]"
    @dragstart.prevent
  >
    <span
      v-if="controls"
      v-repeat-click="decrease"
      class="base-input-number__decrease"
      role="button"
      :class="{ 'is-disabled': minDisabled }"
      @keydown.enter="decrease"
    >
      <i :class="`el-icon-${controlsAtRight ? 'arrow-down' : 'minus'}`"></i>
    </span>
    <span
      v-if="controls"
      v-repeat-click="increase"
      class="base-input-number__increase"
      role="button"
      :class="{ 'is-disabled': maxDisabled }"
      @keydown.enter="increase"
    >
      <i :class="`el-icon-${controlsAtRight ? 'arrow-up' : 'plus'}`"></i>
    </span>
    <el-input
      ref="inputRef"
      :value="displayValue"
      :placeholder="inputNumberDisabled ? '' : placeholder"
      :disabled="inputNumberDisabled"
      :size="inputNumberSize"
      :max="max"
      :min="min"
      :name="name"
      :label="label"
      :clearable="clearable"
      :readonly="readonly"
      @keydown.up.native.prevent="increase"
      @keydown.down.native.prevent="decrease"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      @change="handleInputChange"
    >
      <template v-if="!controls" #prefix>
        <slot name="prefix" />
      </template>
      <template v-if="!controls" #suffix>
        <slot name="suffix" />
      </template>
      <template v-if="!controls" #prepend>
        <slot name="prepend" />
      </template>
      <template v-if="!controls" #append>
        <slot name="append" />
      </template>
    </el-input>
  </div>
</template>

<style lang="scss">
$prefix: base-input-number;
.#{$prefix} {
  position: relative;
  display: inline-block;
  width: 150px;
  line-height: 38px;
  &.align-left {
    .el-input__inner {
      text-align: left;
    }
  }
  &.align-center {
    .el-input__inner {
      text-align: center;
    }
  }
  &.align-right {
    .el-input__inner {
      text-align: right;
    }
  }
  .el-input {
    display: block;
    .el-input__inner {
      padding-right: 50px;
      padding-left: 50px;
      -webkit-appearance: none;
    }
    &.el-input-group--append {
      display: inline-table;
      .el-input-group__append {
        padding: 0 4px;
      }
    }
  }
  &__decrease,
  &__increase {
    position: absolute;
    top: 1px;
    z-index: 1;
    width: 40px;
    height: auto;
    font-size: 13px;
    text-align: center;
    color: #606266;
    background: #f5f7fa;
    cursor: pointer;
  }
  &__decrease {
    left: 1px;
    border-right: 1px solid #dcdfe6;
    border-radius: 4px 0 0 4px;
    &:hover {
      color: var(--color-primary);
      &:not(.is-disabled) ~ .el-input .el-input__inner:not(.is-disabled) {
        border-color: var(--color-primary);
      }
    }
    &.is-disabled {
      color: #c0c4cc;
      cursor: not-allowed;
    }
  }
  &__increase {
    right: 1px;
    border-left: 1px solid #dcdfe6;
    border-radius: 0 4px 4px 0;
    &:hover {
      color: var(--color-primary);
      &:not(.is-disabled) ~ .el-input .el-input__inner:not(.is-disabled) {
        border-color: var(--color-primary);
      }
    }
    &.is-disabled {
      color: #c0c4cc;
      cursor: not-allowed;
    }
  }
  &.is-disabled {
    .#{$prefix} {
      &__decrease {
        border-color: #e4e7ed;
        color: #e4e7ed;
        &:hover {
          color: #e4e7ed;
          cursor: not-allowed;
        }
      }
      &__increase {
        border-color: #e4e7ed;
        color: #e4e7ed;
        &:hover {
          color: #e4e7ed;
          cursor: not-allowed;
        }
      }
    }
  }
  &--medium {
    width: 200px;
    line-height: 34px;
    .#{$prefix}__decrease,
    .#{$prefix}__increase {
      width: 36px;
      font-size: 14px;
    }
    .el-input__inner {
      padding-right: 43px;
      padding-left: 43px;
    }
  }
  &--small {
    line-height: 30px;
    .#{$prefix}__decrease,
    .#{$prefix}__increase {
      width: 32px;
      font-size: 13px;
    }
    .#{$prefix}__decrease [class*='el-icon'],
    .#{$prefix}__increase [class*='el-icon'] {
      transform: scale(0.9);
    }
    .el-input__inner {
      padding-right: 39px;
      padding-left: 39px;
    }
  }
  &--mini {
    line-height: 26px;
    .#{$prefix}__decrease,
    .#{$prefix}__increase {
      width: 28px;
      font-size: 12px;
    }
    .#{$prefix}__decrease [class*='el-icon'],
    .#{$prefix}__increase [class*='el-icon'] {
      transform: scale(0.8);
    }
    .el-input__inner {
      padding-right: 35px;
      padding-left: 35px;
    }
  }
  &.is-without-controls {
    width: 100%;
    .el-input__inner {
      padding-right: 15px;
      padding-left: 15px;
    }
    .el-input--suffix {
      .el-input__inner {
        padding-right: 30px;
      }
    }
  }
  &.is-controls-right {
    .el-input__inner {
      padding-right: 50px;
      padding-left: 15px;
    }
    .#{$prefix}__decrease {
      top: auto;
      right: 1px;
      bottom: 1px;
      left: auto;
      height: auto;
      border-right: none;
      border-left: 1px solid #dcdfe6;
      border-radius: 0 0 4px;
      line-height: 19px;
      & [class*='el-icon'] {
        transform: scale(0.8);
      }
    }
    .#{$prefix}__increase {
      height: auto;
      line-height: 19px;
      border-bottom: 1px solid #dcdfe6;
      border-radius: 0 4px 0 0;
      & [class*='el-icon'] {
        transform: scale(0.8);
      }
    }
  }
  &.is-controls-right[class*='medium'] [class*='decrease'],
  &.is-controls-right[class*='medium'] [class*='increase'] {
    line-height: 17px;
  }
  &.is-controls-right[class*='small'] [class*='decrease'],
  &.is-controls-right[class*='small'] [class*='increase'] {
    line-height: 15px;
  }
  &.is-controls-right[class*='mini'] [class*='decrease'],
  &.is-controls-right[class*='mini'] [class*='increase'] {
    line-height: 13px;
  }
}
</style>

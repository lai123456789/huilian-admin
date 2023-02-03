<script>
import Grid from './grid'
import { getCompanyTranVehicle } from '@/api/company/company-tran-vehicle'

export default {
  name: 'BusinessAutocompleteVehicle',
  components: { Grid },
  inject: {
    elForm: {
      default: ''
    }
  },
  props: {
    value: String,
    label: String,
    moduleName: String,
    disabled: Boolean,
    valueKey: String,
    keyField: {
      type: String,
      default: 'id'
    },
    showMore: {
      type: Boolean,
      default: true
    },
    form: {
      type: Object,
      default: () => ({})
    },
    autoAssign: {
      type: Object,
      default: () => ({})
    },
    clearable: {
      type: Boolean,
      default: true
    },
    params: Object,
    /* 点击新增前的前置操作，需要返回布尔值才能继续操作 */
    addBeforeClick: Function
  },
  data() {
    return {
      modelValue: this.value,
      visible: false
    }
  },
  computed: {
    config() {
      return {
        fetchSuggestions: (payload, callback) => {
          getCompanyTranVehicle(payload).then(res => {
            callback(res.data.records || [])
          })
        },
        valueKey: this.valueKey,
        label: this.label,
        keyField: this.keyField,
        params: this.params
      }
    },
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    }
  },
  watch: {
    value(newValue) {
      this.modelValue = newValue
    },
    modelValue(newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    handleClear() {
      this.$emit('clear')
    },
    handleBlur(ev) {
      this.$emit('blur', ev)
    },
    handleFocus(ev) {
      this.$emit('focus', ev)
    },
    handleInput(value, type) {
      this.$emit('input', value, type)
    },
    handleSelect(rows) {
      const obj = {}
      const oKeys = Object.keys(this.autoAssign)
      for (let i = 0; i < oKeys.length; i++) {
        obj[oKeys[i]] = rows[0][this.autoAssign[oKeys[i]]]
      }
      Object.assign(this.form, obj)
      this.$emit('select', rows)
    },
    handleMoreClick() {
      if (this.inputDisabled) return
      this.visible = true
      this.$refs.baseAutocompleteRef.handleClickOutSide()
    },
    handleCellDblclick({ row }) {
      this.modelValue = row[this.valueKey]
      this.$refs.baseAutocompleteRef.selectSuggestionId = row[this.keyField]
      this.$refs.baseAutocompleteRef.selectSuggestionRows = [row]
      this.$refs.baseAutocompleteRef.handleSelect([row])
      this.visible = false
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-vehicle">
    <base-autocomplete
      ref="baseAutocompleteRef"
      v-model="modelValue"
      :clearable="clearable"
      v-bind="Object.assign(config, $attrs)"
      :disabled="inputDisabled"
      @clear="handleClear"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      @select="handleSelect"
    >
      <template slot="append">
        <i v-if="showMore" class="el-icon-more" @click.stop="handleMoreClick"></i>
      </template>
    </base-autocomplete>
    <base-dialog class="business-autocomplete-vehicle-dialog" width="1100px" :title="label" :visible.sync="visible" :show-footer="false">
      <grid
        v-if="visible"
        :module-name="moduleName"
        :add-before-click="addBeforeClick"
        :params="params"
        @cell-dblclick="handleCellDblclick"
      />
    </base-dialog>
  </div>
</template>

<style lang="scss">
.business-autocomplete-vehicle {
  .el-input-group__append {
    padding: 0 10px;
    > i {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
  .el-input {
    &.is-disabled {
      .el-input-group__append {
        .el-icon-more {
          cursor: not-allowed;
        }
      }
    }
  }
  &-dialog {
    .base-dialog-body {
      padding: 0;
    }
  }
}
</style>

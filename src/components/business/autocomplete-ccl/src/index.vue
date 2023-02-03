<script>
import { getBaseCclCurrency } from '@/api/base/base-ccl-currency'
import { getBaseCclTransactionModeSupportWrapTypeList } from '@/api/base/base-ccl-transaction-mode'
import { getBaseCclWrapType } from '@/api/base/base-ccl-wrap-type'
import { getBaseCclCountry } from '@/api/base/base-ccl-country'
import { getBaseCclDistinatePort } from '@/api/base/base-ccl-distinate-port'
import { getBaseCclDistrict } from '@/api/base/base-ccl-district'
import { getBaseCclEntyPortCode } from '@/api/base/base-ccl-enty-port-code'
import { getBaseCclCustoms } from '@/api/base/base-ccl-customs'
import { getBaseCclContainerFormat } from '@/api/base/base-ccl-container-format'
import { getBaseCclTransportSupportTransportList } from '@/api/base/base-ccl-transport'
import { getBaseCclUnit } from '@/api/base/base-ccl-unit'
import { getBaseCclLevyType } from '@/api/base/base-ccl-levy-type'
import { getBaseCclTrade } from '@/api/base/base-ccl-trade'
import { getBaseCclDestCode } from '@/api/base/base-ccl-dest-code'
import { getBaseCclLevymode } from '@/api/base/base-ccl-levymode'
import { getBaseCclOrgCode } from '@/api/base/base-ccl-org-code'
import { getBaseCclOrigPlaceCode } from '@/api/base/base-ccl-orig-place-code'
import { getBaseCclUsedTo } from '@/api/base/base-ccl-used-to'
import { getBaseCclLicenseDocu } from '@/api/base/base-ccl-license-docu'
import { getBaseCclCopLimit } from '@/api/base/base-ccl-cop-limit'

import constant from '@/constant'
import Grid from './grid'
import autocompleteConfig from '@/config/autocomplete'
import { omit, trim } from 'xe-utils'

export default {
  name: 'BusinessAutocompleteCcl',
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
    valueKey: {
      type: String,
      default: 'name'
    },
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
    params: Object
  },
  data() {
    return {
      modelValue: this.value,
      visible: false,
      port: null
    }
  },
  computed: {
    config() {
      const config = autocompleteConfig[this.moduleName]
      const { fetchSuggestions, port } = this.fetchSuggestionsByModuleName(this.moduleName)
      this.setPort(port)
      return Object.assign({ fetchSuggestions }, config ? omit(config, ['tableConfig']) : {}, {
        label: this.label,
        valueKey: this.valueKey,
        keyField: this.keyField,
        params: this.params
      })
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
      this.modelValue = row[this.valueKey || this.config.valueKey]
      this.$refs.baseAutocompleteRef.selectSuggestionId = row[this.keyField || this.config.keyField]
      this.$refs.baseAutocompleteRef.selectSuggestionRows = [row]
      this.$refs.baseAutocompleteRef.handleSelect([row])
      this.visible = false
    },
    setPort(port) {
      this.port = null
      setTimeout(() => {
        this.port = port
      }, 50)
    },
    fetchSuggestionsByModuleName(moduleName) {
      let port = null
      let fetchSuggestions = (payload, callback) => {
        port(this.handleFetchSuggestionsPayload(payload)).then(res => {
          callback(res.data.records || [])
        })
      }
      const {
        AUTOCOMPLETE_KEY_CCL_CURRENCY,
        AUTOCOMPLETE_KEY_CCL_TRANSPORT,
        AUTOCOMPLETE_KEY_CCL_TRANSACTION_MODE,
        AUTOCOMPLETE_KEY_CCL_WRAP_TYPE,
        AUTOCOMPLETE_KEY_CCL_COUNTRY,
        AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT,
        AUTOCOMPLETE_KEY_CCL_DISTRICT,
        AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE,
        AUTOCOMPLETE_KEY_CCL_CUSTOMS,
        AUTOCOMPLETE_KEY_CCL_CONTAINER_FORMAT,
        AUTOCOMPLETE_KEY_CCL_UNIT,
        AUTOCOMPLETE_KEY_CCL_LEVY_TYPE,
        AUTOCOMPLETE_KEY_CCL_TRADE,
        AUTOCOMPLETE_KEY_CCL_DEST_CODE,
        AUTOCOMPLETE_KEY_CCL_LEVYMODE,
        AUTOCOMPLETE_KEY_CCL_ORG_CODE,
        AUTOCOMPLETE_KEY_CCL_ORIG_PLACE_CODE,
        AUTOCOMPLETE_KEY_CCL_USER_TO,
        AUTOCOMPLETE_KEY_CCL_LICENSE_DOCU,
        AUTOCOMPLETE_KEY_CCL_COP_LIMIT
      } = constant

      switch (moduleName) {
        case AUTOCOMPLETE_KEY_CCL_CURRENCY:
          port = getBaseCclCurrency

          break
        case AUTOCOMPLETE_KEY_CCL_TRANSPORT:
          port = getBaseCclTransportSupportTransportList
          fetchSuggestions = (payload, callback) => {
            getBaseCclTransportSupportTransportList(this.handleFetchSuggestionsPayload(payload)).then(res => {
              callback(res.data || [])
            })
          }
          break
        case AUTOCOMPLETE_KEY_CCL_TRANSACTION_MODE:
          port = getBaseCclTransactionModeSupportWrapTypeList
          fetchSuggestions = (payload, callback) => {
            getBaseCclTransactionModeSupportWrapTypeList(this.handleFetchSuggestionsPayload(payload)).then(res => {
              callback(res.data || [])
            })
          }
          break
        case AUTOCOMPLETE_KEY_CCL_WRAP_TYPE:
          port = getBaseCclWrapType
          break
        case AUTOCOMPLETE_KEY_CCL_COUNTRY:
          port = getBaseCclCountry
          break
        case AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT:
          port = getBaseCclDistinatePort
          break
        case AUTOCOMPLETE_KEY_CCL_DISTRICT:
          port = getBaseCclDistrict
          break
        case AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE:
          port = getBaseCclEntyPortCode
          break
        case AUTOCOMPLETE_KEY_CCL_CUSTOMS:
          port = getBaseCclCustoms
          break
        case AUTOCOMPLETE_KEY_CCL_CONTAINER_FORMAT:
          port = getBaseCclContainerFormat
          break
        case AUTOCOMPLETE_KEY_CCL_UNIT:
          port = getBaseCclUnit
          break
        case AUTOCOMPLETE_KEY_CCL_LEVY_TYPE:
          port = getBaseCclLevyType
          break
        case AUTOCOMPLETE_KEY_CCL_TRADE:
          port = getBaseCclTrade
          break
        case AUTOCOMPLETE_KEY_CCL_DEST_CODE:
          port = getBaseCclDestCode
          break
        case AUTOCOMPLETE_KEY_CCL_LEVYMODE:
          port = getBaseCclLevymode
          break
        case AUTOCOMPLETE_KEY_CCL_ORG_CODE:
          port = getBaseCclOrgCode
          break
        case AUTOCOMPLETE_KEY_CCL_ORIG_PLACE_CODE:
          port = getBaseCclOrigPlaceCode
          break
        case AUTOCOMPLETE_KEY_CCL_USER_TO:
          port = getBaseCclUsedTo
          break
        case AUTOCOMPLETE_KEY_CCL_LICENSE_DOCU:
          port = getBaseCclLicenseDocu
          break
        case AUTOCOMPLETE_KEY_CCL_COP_LIMIT:
          port = getBaseCclCopLimit
          break
      }
      if (!port) throw Error('[fetchSuggestionsByModuleName]: 未匹配到接口地址')
      return {
        port,
        fetchSuggestions
      }
    },
    handleFetchSuggestionsPayload(payload) {
      // 报关参数相关可以根据编码方式查询，故这里后台提供一个参数search
      const obj = { search: payload[this.valueKey] }
      for (const key in payload) {
        if (Object.hasOwnProperty.call(payload, key) && key !== this.valueKey) {
          obj[key] = payload[key]
        }
      }
      return obj
    },
    handleMatchValue(suggestion, modelValue) {
      return suggestion[this.valueKey] === trim(modelValue) || suggestion['code'] === trim(modelValue)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-ccl">
    <base-autocomplete
      ref="baseAutocompleteRef"
      v-model="modelValue"
      :clearable="clearable"
      v-bind="Object.assign(config, $attrs)"
      :disabled="inputDisabled"
      :on-match-value="handleMatchValue"
      @clear="handleClear"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      @select="handleSelect"
    >
      <template v-slot="{ item }">
        <slot :option="item">
          <span>{{ item[config.valueKey] }}</span>
        </slot>
      </template>
      <template slot="append">
        <i v-if="showMore" class="el-icon-more" @click.stop="handleMoreClick"></i>
      </template>
    </base-autocomplete>
    <base-dialog :title="label" :visible.sync="visible" class="business-autocomplete-ccl-dialog" width="1100px" :show-footer="false">
      <grid v-if="visible" :module-name="moduleName" :port="port" :params="params" @cell-dblclick="handleCellDblclick" />
    </base-dialog>
  </div>
</template>

<style lang="scss">
.business-autocomplete-ccl {
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

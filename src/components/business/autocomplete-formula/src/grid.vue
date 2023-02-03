<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { getBaseSettlementFormula } from '@/api/base/base-settlement-formula'
import EnterForm from '@/views/admin/settlement-formula/components/enter-form'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'

export default {
  name: 'Grid',
  components: { EnterForm },
  props: {
    moduleName: String,
    params: Object
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    config() {
      return {
        request: ({ pager, params, extraParams }) => {
          return new Promise(resolve => {
            getBaseSettlementFormula({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
              const { records, total } = res.data
              resolve({
                data: records || [],
                total
              })
            })
          })
        },
        columns: [
          { field: 'name', title: '公式名称', searchProps: true },
          { field: 'formula', title: '计算公式', searchProps: true },
          {
            field: 'tradeMode',
            title: '贸易模式',
            searchProps: { type: 'select' },
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
              }
            }
          }
        ],
        buttonsConfig: {
          add: {
            visible: this.permissions[constant.PERMISSION_SET_FORMULA_ADD],
            handler: this.handleAdded
          }
        }
      }
    }
  },

  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleCellDblclick($table) {
      this.$emit('cell-dblclick', $table)
    },
    reLoad() {
      this.$refs['autocompleteFormulaGridRef'].refresh(false)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-formula-grid">
    <base-page
      ref="autocompleteFormulaGridRef"
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_FORMULA"
      :extra-params="params"
      v-bind="config"
      :show-checkbox="false"
      :tools-config="{
        setting: {
          visible: false
        },
        download: {
          visible: false
        }
      }"
      @cell-dblclick="handleCellDblclick"
    >
    </base-page>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :re-load="reLoad"></enter-form>
  </div>
</template>

<style lang="scss" scoped>
.business-autocomplete-formula-grid {
  height: 70vh;
}
</style>

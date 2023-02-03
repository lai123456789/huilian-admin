<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { getCompanyBank } from '@/api/company/company-bank'
import EnterForm from '@/views/common/components/enter-form-bank'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'

export default {
  name: 'Grid',
  components: { EnterForm },
  props: {
    moduleName: String,
    params: Object,
    addBeforeClick: Function
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
            getCompanyBank({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
              const { records, total } = res.data
              resolve({
                data: records || [],
                total
              })
            })
          })
        },
        columns: [
          { field: 'bankName', title: '银行名称' },
          { field: 'accountCode', title: '银行账号' },
          { field: 'accountName', title: '开户名称' },
          { field: 'bankAddress', title: '银行地址' },
          {
            field: 'companyRegion',
            title: '所属区域',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COMPANY_REGION)
              }
            },
            searchProps: { type: 'select' }
          }
        ],
        buttonsConfig: {
          add: {
            visible: true,
            handler: this.handleAdded
          }
        }
      }
    }
  },

  methods: {
    async handleAdded() {
      if (this.addBeforeClick && (await this.addBeforeClick())) {
        this.enterForm = {
          visible: true,
          type: enums.FORM_TYPE.getFieldByKey('ADDED')
        }
      }
    },
    handleCellDblclick($table) {
      this.$emit('cell-dblclick', $table)
    },
    reLoad() {
      this.$refs['autocompleteBankGridRef'].refresh(false)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-bank-grid">
    <base-page
      ref="autocompleteBankGridRef"
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_BANK"
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
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="params" :re-load="reLoad"></enter-form>
  </div>
</template>

<style lang="scss" scoped>
.business-autocomplete-bank-grid {
  height: 70vh;
}
</style>

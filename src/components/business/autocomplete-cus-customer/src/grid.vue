<script>
import { getCompanyCusCustomer } from '@/api/company/company-cus-customer'
import { getDataDictionary } from '@/api/admin/dicts'
import EnterForm from '@/views/company/customer/components/enter-form-cus-customer'
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
            getCompanyCusCustomer({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
              const { records, total } = res.data
              resolve({
                data: records || [],
                total
              })
            })
          })
        },
        columns: [
          { field: 'companyName', title: '企业名称', searchProps: true },
          { field: 'companyNameEn', title: '企业英文名称' },
          { field: 'companyAddress', title: '企业地址' },
          { field: 'companyAddressEn', title: '企业英文地址' },
          {
            field: 'region',
            title: '所属区域',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COMPANY_REGION)
              }
            }
          },
          { field: 'mobile', title: '手机号' },
          { field: 'person', title: '联系人' },
          { field: 'phone', title: '座机' },
          { field: 'remark', title: '备注' }
        ],
        buttonsConfig: {
          // add: {
          //   visible: this.permissions[constant.PERMISSION_DRIVER_ADD],
          //   handler: this.handleAdded
          // }
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
      this.$refs['autocompleteCusCustomerGridRef'].refresh(false)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-cus-customer-grid">
    <base-page
      ref="autocompleteCusCustomerGridRef"
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_CUS_CUSTOMER"
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
    <enter-form v-model="enterForm.visible" :table-row="params" :type="enterForm.type" :re-load="reLoad"></enter-form>
  </div>
</template>

<style lang="scss" scoped>
.business-autocomplete-cus-customer-grid {
  height: 70vh;
}
</style>

<script>
// 服务费项目
import { queryForMakeInvoiceAcctCostInvoice } from '@/api/finance/acct-cost-invoice'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'DetailsCreateC',
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      default: false
    },
    params: Object,
    parentDetailsTableInstance: Function
  },
  data() {
    return {
      constant,
      visible: this.value,
      tableRow: {},
      request: null,
      showPage: false,
      columns: []
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.isOnce = true

        this.columns = [
          { field: 'costNo', title: '应收编号', searchProps: true },
          { field: 'orderNo', title: '订单编号', searchProps: true },
          { field: 'payCompanyName', title: '客户名称' },
          {
            field: 'costType',
            title: '费用大类',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COST_TYPE)
              }
            }
          },
          { field: 'costName', title: '费用名称', searchProps: true },
          {
            field: 'settleMoney',
            title: '可开票金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          },
          { field: 'remark', title: '备注' }
        ]

        this.request = async ({ pager, params }) => {
          const { data } = await queryForMakeInvoiceAcctCostInvoice({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params))
          })

          if (this.isOnce) {
            const detailsData = this.parentDetailsTableInstance().getRecords()
            this.$refs.detailsCreateRef?.setTableCheckRowKeys(detailsData.map(v => ({ id: v.id })))
            this.isOnce = false
          }

          return Promise.resolve({
            data: data.records,
            total: data.total
          })
        }
        this.showPage = true
      } else {
        this.showPage = false
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    reLoad(isClearSelect) {
      this.$refs['detailsCreateRef'].refresh(isClearSelect)
    },
    handleSave(done) {
      this.$emit('save', this.$refs.detailsCreateRef.getCheckboxRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="details-create-c-dialog" :visible.sync="visible" width="80%" title="服务费项目" @save="handleSave">
    <div class="details-create">
      <base-page
        v-if="showPage"
        ref="detailsCreateRef"
        :name="constant.TABLE_NAME_SALES_TICKET_SERVICE_CREATE"
        :reserve="true"
        :tools-config="{
          setting: {
            visible: false
          },
          download: {
            visible: false
          }
        }"
        :search-config="{
          labelWidth: '110px'
        }"
        show-footer
        :columns="columns"
        :request="request"
      />
    </div>
  </base-dialog>
</template>

<style lang="scss">
.details-create-c-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .details-create {
    height: 60vh;
  }
}
</style>

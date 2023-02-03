<script>
// 开票订单
import { queryForMakeInvoiceOrderImport } from '@/api/order/order-import'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'DetailsCreateA',
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
          { field: 'orderNo', title: '订单编号', searchProps: true },
          { field: 'orderDate', title: '订单日期' },
          { field: 'customerName', title: '客户名称' },
          { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
          {
            field: 'cargoMoney',
            title: '货款',
            align: 'right',
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'taxMoney',
            title: '税额',
            align: 'right',
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'makeInvoiceMoney',
            title: '开票金额',
            align: 'right',
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          { field: 'remark', title: '备注' }
        ]

        this.request = async ({ pager, params }) => {
          const { data } = await queryForMakeInvoiceOrderImport({
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
  <base-dialog custom-class="details-create-a-dialog" :visible.sync="visible" width="80%" title="开票货款" @save="handleSave">
    <div class="details-create">
      <base-page
        v-if="showPage"
        ref="detailsCreateRef"
        :name="constant.TABLE_NAME_SALES_TICKET_INVOICE_CREATE"
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
.details-create-a-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .details-create {
    height: 60vh;
  }
}
</style>

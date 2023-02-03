<script>
import { queryForNotPaymentOrderImport } from '@/api/order/order-import'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'ForNoPay',
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
          { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
          { field: 'orderDate', title: '订单日期', searchProps: { type: 'date' } },
          { field: 'customerName', title: '客户名称' },
          { field: 'supplierName', title: '供应商名称' },
          {
            field: 'totalMoney',
            title: '订单金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'payApplyMoney',
            title: '已付汇金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          }
        ]
        this.request = async ({ pager, params }) => {
          const { data } = await queryForNotPaymentOrderImport({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params))
          })

          if (this.isOnce) {
            const detailsData = this.parentDetailsTableInstance().getRecords()
            this.$refs.receiptForNoPayRef?.setTableCheckRowKeys(detailsData.map(v => ({ id: v.id })))
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
      this.$refs['receiptForNoPayRef'].refresh(isClearSelect)
    },
    handleSave(done) {
      this.$emit('save', this.$refs.receiptForNoPayRef.getCheckboxRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="receipt-for-no-pay-dialog" :visible.sync="visible" width="80%" title="查询未付汇的订单" @save="handleSave">
    <div class="receipt-for-no-pay">
      <base-page
        v-if="showPage"
        ref="receiptForNoPayRef"
        :name="constant.TABLE_NAME_ACCT_RECEIPT_PAYMENT_FOR_NO_PAY"
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
          labelWidth: '90px'
        }"
        show-footer
        :columns="columns"
        :request="request"
      />
    </div>
  </base-dialog>
</template>

<style lang="scss">
.receipt-for-no-pay-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .receipt-for-no-pay {
    height: 60vh;
  }
}
</style>

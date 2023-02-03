<script>
import { queryForNotPaymentOrderExport } from '@/api/order/order-export'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'ForNoSettle',
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
          { field: 'totalMoney', title: '订单金额' },
          { field: 'payApplyMoney', title: '已结汇金额' }
        ]
        this.request = async ({ pager, params }) => {
          const { data } = await queryForNotPaymentOrderExport({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params))
          })

          if (this.isOnce) {
            const detailsData = this.parentDetailsTableInstance().getRecords()
            this.$refs.receiptForNoSettleRef?.setTableCheckRowKeys(detailsData.map(v => ({ id: v.id })))
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
      this.$refs['receiptForNoSettleRef'].refresh(isClearSelect)
    },
    handleSave(done) {
      this.$emit('save', this.$refs.receiptForNoSettleRef.getCheckboxRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog
    custom-class="receipt-for-no-settle-dialog"
    :visible.sync="visible"
    width="80%"
    title="查询未结汇订单记录"
    @save="handleSave"
  >
    <div class="receipt-for-no-settle">
      <base-page
        v-if="showPage"
        ref="receiptForNoSettleRef"
        :name="constant.TABLE_NAME_ACCT_RECEIPT_SETTLE_FOR_NO_SETTLE"
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
.receipt-for-no-settle-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .receipt-for-no-settle {
    height: 60vh;
  }
}
</style>

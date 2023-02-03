<script>
import { getAcctCostInvoice } from '@/api/finance/acct-cost-invoice'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'ReceiptVerification',
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
          {
            field: 'orderType',
            title: '订单类型',
            searchProps: {
              type: 'select'
            },
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
              }
            }
          },
          { field: 'orderNo', title: '订单编号', searchProps: true },
          { field: 'costNo', title: '应收编号', searchProps: true },
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
          { field: 'costDate', title: '费用发生日期' },
          { field: 'settleDate', title: '应收日期' },
          { field: 'settleCurrency', title: '应收币别' },
          {
            field: 'settleMoney',
            title: '应收金额',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'verifyMoney',
            title: '已收金额',
            formatter: {
              type: 'number'
            }
          }
        ]
        this.request = async ({ pager, params }) => {
          const { data } = await getAcctCostInvoice({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params))
          })

          if (this.isOnce) {
            const detailsData = this.parentDetailsTableInstance().getRecords()
            this.$refs.receiptVerificationRef?.setTableCheckRowKeys(detailsData.map(v => ({ id: v.id })))
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
      this.$refs['receiptVerificationRef'].refresh(isClearSelect)
    },
    handleSave(done) {
      this.$emit('save', this.$refs.receiptVerificationRef.getCheckboxRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="receipt-verification-dialog" :visible.sync="visible" width="80%" title="核销列表" @save="handleSave">
    <div class="receipt-verification">
      <base-page
        v-if="showPage"
        ref="receiptVerificationRef"
        :name="constant.TABLE_NAME_ACCT_RECEIPT_VERIFICATION"
        :reserve="true"
        :tools-config="{
          setting: {
            visible: false
          },
          download: {
            visible: false
          }
        }"
        show-footer
        :columns="columns"
        :request="request"
      />
    </div>
  </base-dialog>
</template>

<style lang="scss">
.receipt-verification-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .receipt-verification {
    height: 60vh;
  }
}
</style>

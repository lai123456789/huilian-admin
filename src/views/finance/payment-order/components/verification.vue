<script>
import { getAcctCostPay } from '@/api/finance/acct-cost-pay'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'PaymentVerification',
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
          { field: 'costNo', title: '应付编号', searchProps: true },
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
          { field: 'settleCurrency', title: '应付币别' },
          {
            field: 'settleMoney',
            title: '应付金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'verifyMoney',
            title: '已付金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          }
        ]
        this.request = async ({ pager, params }) => {
          const { data } = await getAcctCostPay({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params))
          })

          if (this.isOnce) {
            const detailsData = this.parentDetailsTableInstance().getRecords()
            this.$refs.paymentVerificationRef?.setTableCheckRowKeys(detailsData.map(v => ({ id: v.id })))
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
      this.$refs['paymentVerificationRef'].refresh(isClearSelect)
    },
    handleSave(done) {
      this.$emit('save', this.$refs.paymentVerificationRef.getCheckboxRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="payment-verification-dialog" :visible.sync="visible" width="80%" title="核销列表" @save="handleSave">
    <div class="payment-verification">
      <base-page
        v-if="showPage"
        ref="paymentVerificationRef"
        :name="constant.TABLE_NAME_ACCT_PAYMENT_VERIFICATION"
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
.payment-verification-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .payment-verification {
    height: 60vh;
  }
}
</style>

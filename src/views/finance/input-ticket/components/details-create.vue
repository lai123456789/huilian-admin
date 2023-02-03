<script>
import { queryForReceiveInvoiceOrderExportDetail } from '@/api/order/order-export-detail'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'DetailsCreate',
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
          { field: 'productModel', title: '型号', searchProps: true },
          { field: 'productName', title: '品名', searchProps: true },
          { field: 'productUnit', title: '单位' },
          { field: 'qty', title: '总数量' },
          { field: 'receiveInvoiceQty', title: '已开票数量' },
          {
            field: 'purchasePrice',
            title: '单价',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          {
            field: 'receiveInvoiceMoney',
            title: '已开票金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'receiveMoney',
            title: '剩余开票金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          }
        ]

        this.request = async ({ pager, params }) => {
          const { data } = await queryForReceiveInvoiceOrderExportDetail({
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
  <base-dialog custom-class="input-ticket-details-create-dialog" :visible.sync="visible" width="80%" title="发票明细" @save="handleSave">
    <div class="details-create">
      <base-page
        v-if="showPage"
        ref="detailsCreateRef"
        :name="constant.TABLE_NAME_INPUT_TICKET_CREATE"
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
.input-ticket-details-create-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .details-create {
    height: 60vh;
  }
}
</style>

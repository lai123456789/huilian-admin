<script>
// 关联票差
import { queryForMakeInvoiceDiff } from '@/api/finance/acct-make-invoice-diff'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'DetailsCreateD',
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
          { field: 'invoiceDiffNo', title: '票差编号', searchProps: true },
          { field: 'orderNo', title: '订单编号', searchProps: true },
          { field: 'customerName', title: '客户名称', searchProps: true },
          {
            field: 'totalMoney',
            title: '票差金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'deductMoney',
            title: '已抵扣票差金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'unDeductMoney',
            title: '未抵扣票差金额',
            align: 'right',
            formatter: {
              type: 'number'
            }
          }
        ]

        this.request = async ({ pager, params }) => {
          const { data } = await queryForMakeInvoiceDiff({
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
  <base-dialog custom-class="details-create-d-dialog" :visible.sync="visible" width="80%" title="票差列表" @save="handleSave">
    <div class="details-create">
      <base-page
        v-if="showPage"
        ref="detailsCreateRef"
        :name="constant.TABLE_NAME_SALES_TICKET_DIFF_VOT_CREATE"
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
.details-create-d-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .details-create {
    height: 60vh;
  }
}
</style>

<script>
import { getForOrderSaleOrderAgentSaleDetail } from '@/api/order/order-agent-sale-detail'
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
          { field: 'productNo', title: '商品编号' },
          { field: 'productName', title: '品名' },
          { field: 'productModel', title: '型号' },
          { field: 'productBrand', title: '品牌' },
          { field: 'productOrigin', title: '产地' },
          { field: 'productUnit', title: '单位' },
          {
            field: 'qty',
            title: '数量',
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            }
          },
          {
            field: 'saleQty',
            title: '已做销售数量',
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            }
          },
          {
            field: 'price',
            title: '采购单价',
            align: 'right',
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
            field: 'totalMoney',
            title: '采购总价',
            align: 'right',
            formatter: {
              type: 'number'
            }
          },
          { field: 'remark', title: '备注' }
        ]

        this.request = async ({ pager, params }) => {
          const { data } = await getForOrderSaleOrderAgentSaleDetail({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params))
          })

          if (this.isOnce) {
            const detailsData = this.parentDetailsTableInstance().getRecords()
            this.$refs.detailsCreateRef?.setTableCheckRowKeys(detailsData.map(v => ({ id: v.id })))
            this.isOnce = false
          }

          return Promise.resolve({
            data,
            total: data.length
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
  <base-dialog custom-class="sales-order-details-create-dialog" :visible.sync="visible" width="80%" title="商品订单查询" @save="handleSave">
    <div class="details-create">
      <base-page
        v-if="showPage"
        ref="detailsCreateRef"
        :name="constant.TABLE_NAME_PAY_ORDER_DETAILS_CREATE"
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
        :columns="columns"
        :request="request"
      />
    </div>
  </base-dialog>
</template>

<style lang="scss">
.sales-order-details-create-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .details-create {
    height: 60vh;
  }
}
</style>

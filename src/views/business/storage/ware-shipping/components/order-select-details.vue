<script>
import { getForShippingOrderImportDetail } from '@/api/order/order-import-detail'
import { getForShippingOrderExportDetail } from '@/api/order/order-export-detail'
import { getForShippingOrderAgentPurchaseDetail } from '@/api/order/order-agent-purchase-detail'
import { getForShippingOrderSaleDetail } from '@/api/order/order-sale-detail'
import { getForShippingOrderAgentFreightDetail } from '@/api/order/order-agent-freight-detail'
import { getForShippingOrderStorageDetail } from '@/api/order/order-storage-detail'
import { transforArrayPayload } from '@/utils'
import enums from '@/enums'
import constant from '@/constant'

export default {
  name: 'OrderSelectDetails',
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderType: String,
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
        this.getColumnsByOrderType()
        this.request = async ({ pager, params }) => {
          const { data } = await this.getOrderTypeCorresDetailForReceive()({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params))
          })

          if (this.isOnce) {
            const detailsData = this.parentDetailsTableInstance().getRecords()
            this.$refs.orderSelectDetailsRef?.setTableCheckRowKeys(detailsData.map(v => ({ id: v.orderDetailId })))
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
    getColumnsByOrderType() {
      if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        this.columns = [
          { field: 'partNo', title: '料号', searchProps: { type: 'input', sort: 2 } },
          { field: 'productNo', title: '商品编号' },
          { field: 'orderNo', title: '订单编号', searchProps: true },
          { field: 'productName', title: '品名', searchProps: true },
          { field: 'productModel', title: '型号', searchProps: { type: 'input', sort: 1 } },
          { field: 'productBrand', title: '品牌', searchProps: true },
          { field: 'productOrigin', title: '产地' },
          { field: 'productUnit', title: '单位' },
          {
            field: 'qty',
            title: '数量',
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
            field: 'shippingQty',
            title: '已做出库数量',
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
            field: 'price',
            title: '采购单价',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 },
            align: 'right'
          },
          {
            field: 'totalMoney',
            title: '采购总价',
            sum: true,
            formatter: {
              type: 'number'
            },
            align: 'right'
          },
          { field: 'lotNo', title: '批号', searchProps: true },
          { field: 'dateCode', title: '生产日期', searchProps: true },
          { field: 'remark', title: '备注' }
        ]
      } else {
        this.columns = [
          { field: 'partNo', title: '料号', searchProps: { type: 'input', sort: 1 } },
          { field: 'productNo', title: '商品编号' },
          { field: 'orderNo', title: '订单编号', searchProps: true },
          { field: 'productName', title: '品名', searchProps: true },
          { field: 'productModel', title: '型号', searchProps: true },
          { field: 'productBrand', title: '品牌', searchProps: true },
          { field: 'productOrigin', title: '产地' },
          { field: 'productUnit', title: '单位' },
          {
            field: 'qty',
            title: '数量',
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
            field: 'shippingQty',
            title: '已做出库数量',
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
            field: 'price',
            title: '采购单价',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 },
            align: 'right'
          },
          {
            field: 'totalMoney',
            title: '采购总价',
            sum: true,
            formatter: {
              type: 'number'
            },
            align: 'right'
          },
          { field: 'remark', title: '备注' }
        ]
      }
    },
    // 获取不同订单类型下订单出库信息
    getOrderTypeCorresDetailForReceive() {
      let result = null
      /* 进口订单 */
      if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        result = getForShippingOrderImportDetail
        /* 出口订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        result = getForShippingOrderExportDetail
        /* 代采订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
        result = getForShippingOrderAgentPurchaseDetail
        /* 销售订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('SALE')) {
        result = getForShippingOrderSaleDetail
        /* 仓储订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = getForShippingOrderStorageDetail
        /* 货代订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = getForShippingOrderAgentFreightDetail
      }
      return result
    },
    reLoad(isClearSelect) {
      this.$refs['orderSelectDetailsRef'].refresh(isClearSelect)
    },
    handleSave(done) {
      this.$emit('save', this.$refs.orderSelectDetailsRef.getCheckboxRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="order-select-details-dialog" :visible.sync="visible" width="80%" title="商品订单查询" @save="handleSave">
    <div class="order-select-details">
      <base-page
        v-if="showPage"
        ref="orderSelectDetailsRef"
        :name="constant.TABLE_NAME_WARE_SHIPPING_ORDER_SELECT_DETAILS"
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
          labelWidth: '70px'
        }"
        show-footer
        :columns="columns"
        :request="request"
      />
    </div>
  </base-dialog>
</template>

<style lang="scss">
.order-select-details-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .order-select-details {
    height: 60vh;
  }
}
</style>

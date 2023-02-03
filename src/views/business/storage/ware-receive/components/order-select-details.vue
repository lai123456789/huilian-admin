<script>
import { getForReceivingOrderImportDetail } from '@/api/order/order-import-detail'
import { getForReceivingOrderExportDetail } from '@/api/order/order-export-detail'
import { getForReceivingOrderAgentPurchaseDetail } from '@/api/order/order-agent-purchase-detail'
import { getForReceivingOrderAgentFreightDetail } from '@/api/order/order-agent-freight-detail'
import { getForReceivingOrderAgentSaleDetail } from '@/api/order/order-agent-sale-detail'
import { getForReceivingOrderPurchaseDetail } from '@/api/order/order-purchase-detail'
import { getForReceivingOrderStorageDetail } from '@/api/order/order-storage-detail'
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
    params: Object,
    orderType: String,
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
    getColumnsByOrderType() {
      if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
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
            field: 'receivingQty',
            title: '已做入库数量',
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
          {
            field: 'netWeight',
            title: '净重',
            sum: true,
            formatter: {
              type: 'number'
            },
            align: 'right'
          },
          {
            field: 'grossWeight',
            title: '毛重',
            sum: true,
            formatter: {
              type: 'number'
            },
            align: 'right'
          },
          { field: 'volume', title: '体积' },
          {
            field: 'packages',
            title: '件数',
            sum: true,
            formatter: {
              type: 'number'
            },
            align: 'right'
          },
          { field: 'partNo', title: '料号' },
          { field: 'lotNo', title: '批号' },
          { field: 'dateCode', title: '生产日期' },
          { field: 'remark', title: '备注' }
        ]
      } else {
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
            field: 'receivingQty',
            title: '已做入库数量',
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

      if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        result = getForReceivingOrderImportDetail
        /* 出口订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        result = getForReceivingOrderExportDetail
        /* 代采订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
        result = getForReceivingOrderAgentPurchaseDetail
        /* 代销订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_SALE')) {
        result = getForReceivingOrderAgentSaleDetail
        /* 采购订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('PURCHASE')) {
        result = getForReceivingOrderPurchaseDetail
        /* 仓储订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = getForReceivingOrderStorageDetail
        // /* 货代订单 */
      } else if (this.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = getForReceivingOrderAgentFreightDetail
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
        :name="constant.TABLE_NAME_WARE_RECEIVING_ORDER_SELECT_DETAILS"
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
.order-select-details-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .order-select-details {
    height: 60vh;
  }
}
</style>

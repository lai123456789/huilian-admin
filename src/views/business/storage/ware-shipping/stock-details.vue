<!-- 备货明细 -->
<script>
import { getWareStockMatch } from '@/api/warehouse/ware-stock-match'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'WareShipping',
  props: {
    tableRow: Object
  },
  data() {
    return {
      constant,
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getWareStockMatch({
          ...pager,
          ...transforArrayPayload(Object.assign({ shippingId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'partNo', title: '料号' },
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        {
          field: 'matchQty',
          title: '备货数量',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        { field: 'location', title: '库位' },
        { field: 'ctnsNo', title: '箱号' },
        { field: 'lotNo', title: '批号' },
        { field: 'dateCode', title: '生产日期' },
        { field: 'orderNo', title: '订单编号' },
        { field: 'receivingNo', title: '入库单号' },
        { field: 'remark', title: '备注' }
      ]
    }
  },
  methods: {
    reLoad(isClearSelect) {
      this.$refs['shippingRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="shipping">
    <!-- 列表页 -->
    <base-page ref="shippingRef" :name="constant.TABLE_NAME_WARE_SHIPPING_STOCK" :columns="columns" :request="request" show-footer />
  </div>
</template>

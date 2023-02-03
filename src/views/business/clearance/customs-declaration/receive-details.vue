<!-- 报关单-入库单明细 -->
<script>
import { getWareReceivingDetail } from '@/api/warehouse/ware-receiving-detail'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { jumpCorresOrder } from '@/utils/jump'

export default {
  name: 'WareReceivingDetail',
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getWareReceivingDetail({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                customsId: this.tableRow.id,
                orderType: this.tableRow.iEFlag
              },
              params
            )
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'orderNo', title: '订单编号', searchProps: true, link: row => jumpCorresOrder(row, this, this.tableRow.iEFlag) },
        { field: 'receivingNo', title: '入库单号', searchProps: true, link: { name: constant.ROUTE_RECEIVING, toField: true } },
        { field: 'warehouseName', title: '仓库名称', searchProps: true },
        { field: 'receivingDate', title: '入库日期' },
        { field: 'productNo', title: '商品编号', searchProps: true },
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        { field: 'qty', title: '数量', sum: true },
        {
          field: 'price',
          title: '单价',
          sum: true,
          footerConfig: { precision: 6 },
          align: 'right',
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        { field: 'totalMoney', title: '总价', sum: true, align: 'right' },
        { field: 'packages', title: '件数', sum: true },
        { field: 'location', title: '库位' },
        { field: 'ctnsNo', title: '箱号' },
        { field: 'partNo', title: '料号' },
        { field: 'lotNo', title: '批号' },
        { field: 'netWeight', title: '净重', sum: true },
        { field: 'grossWeight', title: '毛重', sum: true },
        { field: 'dateCode', title: '生产日期' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {},
      jumpAddedObj: null
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  }
}
</script>

<template>
  <div class="receiving-detail">
    <!-- 列表页 -->
    <base-page
      ref="receivingDetailRef"
      :name="constant.TABLE_NAME_CUSTOMS_RECEIVING_DETAIL"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '100px'
      }"
    />
  </div>
</template>

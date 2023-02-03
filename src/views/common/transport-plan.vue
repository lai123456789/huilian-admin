<!-- 跨境订车计划 -->
<script>
import { getWareStockInto } from '@/api/warehouse/ware-stock-into'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'TransportPlan',
  components: {},
  props: {
    tableRow: Object,
    orderType: String,
    permissionObj: Object
  },
  data() {
    return {
      constant,
      enums,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getWareStockInto({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              { orderId: this.tableRow.id, orderType: this.tableRow.orderType, filterStock: enums.FILTER_STOCK.getFieldByKey('YES') },
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
        { field: 'warehouseName', title: '仓库名称', searchProps: true, link: { name: constant.ROUTE_WAREHOUSE, toField: true } },
        { field: 'productNo', title: '商品编号' },
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        { field: 'stockDays', title: '库龄' },
        {
          field: 'stockQty',
          title: '库存数量',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'totalMoney',
          title: '库存货值',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'price',
          title: '库存单价',
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
        { field: 'receivingNo', title: '入库单号', searchProps: true },
        { field: 'receivingDate', title: '入库日期', searchProps: { type: 'date', sort: 3 } },
        { field: 'receivingQty', title: '入库数量', sum: true },
        { field: 'matchQty', title: '备货数量', sum: true },
        { field: 'ctnsNo', title: '箱号' },
        { field: 'partNo', title: '料号', searchProps: { type: 'input', sort: 1 } },
        { field: 'lotNo', title: '批号' },
        { field: 'dateCode', title: '生产日期' },
        { field: 'location', title: '库位' },
        {
          field: 'filterStock',
          title: '过滤无库存数据',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WARE_FILTER_STOCK)
            }
          },
          visible: false,
          searchProps: { type: 'select' }
        },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      mores: [
        {
          label: '生成跨境运输单',
          visible: this.permissions[this.permissionObj.create],
          handler: this.handleCreate
        }
      ]
    }
  },
  methods: {
    handleCreate() {},
    reLoad(isClearSelect) {
      this.$refs['TransportPlanRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="transport-plan">
    <!-- 列表页 -->
    <base-page
      ref="TransportPlanRef"
      :name="constant.TABLE_NAME_COMMON_STOCK"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '85px',
        form: {
          filterStock: enums.FILTER_STOCK.getFieldByKey('YES')
        }
      }"
    />
  </div>
</template>

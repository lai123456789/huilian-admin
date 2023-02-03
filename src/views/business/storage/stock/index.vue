<!-- 库存记录 -->
<script>
import { getWareStockInto } from '@/api/warehouse/ware-stock-into'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresOrder } from '@/utils/jump'
import Drawer from './components/drawer'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

export default {
  name: 'Stock',
  components: { Drawer },
  props: {
    permissionsReceiveRecord: Object
  },
  data() {
    return {
      constant,
      enums,
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
        const { data } = await getWareStockInto({
          ...pager,
          ...transforArrayPayload(params),
          filterStock: enums.FILTER_STOCK.getFieldByKey('YES')
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'warehouseName', title: '仓库名称', searchProps: true, link: { name: constant.ROUTE_WAREHOUSE, toField: true } },
        {
          field: 'orderType',
          title: '订单类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
            }
          }
        },
        { field: 'orderNo', title: '订单编号', searchProps: true, link: row => jumpCorresOrder(row, this) },
        {
          field: 'customerName',
          title: '客户名称',
          searchProps: true,
          link: { name: constant.ROUTE_CUSTOMS_DECLARATION, toField: 'companyName' }
        },
        { field: 'supplierName', title: '供应商名称', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: 'companyName' } },
        { field: 'productNo', title: '商品编号' },
        { field: 'productName', title: '品名' },
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
        {
          field: 'shippingQty',
          title: '已出库数量',
          formatter(_, row) {
            return new BigNumber(Number(row.stockQty)).minus(Number(row.receivingQty)).toNumber()
          }
        },
        { field: 'matchQty', title: '备货数量', sum: true },
        { field: 'ctnsNo', title: '箱号' },
        { field: 'partNo', title: '料号', searchProps: { type: 'input', sort: 1 } },
        { field: 'productModel', title: '型号', searchProps: { type: 'input', sort: 2 } },
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
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_STOCK],
      mark: constant.PERMISSION_STOCK
    }
    this.buttonsConfig = {}
  },
  methods: {
    openDetails({ row }) {
      const { shippingNo } = row
      this.mainRow = row
      this.details = {
        visible: true,
        title: shippingNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['stockRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="stock">
    <!-- 列表页 -->
    <base-page
      ref="stockRef"
      :name="constant.TABLE_NAME_STOCK"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :search-config="{
        labelWidth: '85px',
        form: {
          filterStock: enums.FILTER_STOCK.getFieldByKey('YES')
        }
      }"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="mainRow" :re-load="reLoad"></drawer>
  </div>
</template>

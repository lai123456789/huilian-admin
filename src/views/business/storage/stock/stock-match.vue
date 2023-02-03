<!-- 库存匹配记录 -->
<script>
import { getWareStockMatch } from '@/api/warehouse/ware-stock-match'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresOrder } from '@/utils/jump'

export default {
  name: 'StockMatch',
  components: {},
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    deleteFn: {
      type: Function,
      default: () => () => {}
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getWareStockMatch({ ...pager, ...transforArrayPayload(Object.assign({ intoId: this.tableRow.id }, params)) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'shippingNo', title: '出库单号', searchProps: true },
        {
          field: 'status',
          title: '出库状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WARE_SHIPPING_STATUS)
            }
          },
          searchProps: true
        },
        { field: 'orderNo', title: '订单编号', searchProps: true, link: row => jumpCorresOrder(row, this) },
        { field: 'matchQty', title: '匹配数量' },
        { field: 'createByName', title: '	创建人名称' },
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
  methods: {}
}
</script>

<template>
  <div class="stock-match">
    <!-- 列表页 -->
    <base-page
      ref="stockMatchRef"
      :name="constant.TABLE_NAME_STOCK_MATCH"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :buttons-config="buttonsConfig"
    />
  </div>
</template>

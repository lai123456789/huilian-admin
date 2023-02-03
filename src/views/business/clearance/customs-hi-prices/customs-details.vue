<!-- 报关单明细 -->
<script>
import { getCustomsMasterDetail } from '@/api/customs/customs-master-detail'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import dayjs from '@/utils/day'

export default {
  name: 'CustomsDetails',
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
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCustomsMasterDetail({
          ...pager,
          ...transforArrayPayload(
            {
              ieFlag: this.tableRow.ieFlag,
              declareStatus: '4', // TODO 这里的申报状态对不上,可能是当前跟后台约定的 -> 申报成功
              declareDate: `${dayjs().subtract(this.tableRow.month, 'month').format('YYYY-MM-DD')},${dayjs()
                .subtract(1, 'day')
                .format('YYYY-MM-DD')}`,
              productBrand: this.tableRow.productBrand || ' ',
              productModel: this.tableRow.productModel || ' ',
              currencyName: this.tableRow.currencyName || ' ',
              gUnit: this.tableRow.productUnit || ' '
            },
            params
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'declareDate', title: '申报日期' },
        { field: 'contrNo', title: '合同协议号', searchProps: true, link: { name: constant.ROUTE_CUSTOMS_DECLARATION, toField: true } },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'codeTS', title: '商品编号' },
        { field: 'gName', title: '商品名称' },
        { field: 'gModel', title: '规格' },
        { field: 'gQty', title: '成交数量' },
        { field: 'gUnit', title: '成交单位' },
        {
          field: 'customsPrice',
          title: '报关单价',
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
          field: 'customsTotal',
          title: '报关总价',
          formatter: {
            type: 'number'
          }
        },
        { field: 'tradeCurr', title: '币制' },
        { field: 'originCountry', title: '原产国(地区)' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  created() {
    // this.helpConfig = {
    //   show: this.permissions[constant.PERMISSION_STOCK],
    //   mark: constant.PERMISSION_STOCK
    // }
    this.buttonsConfig = {}
  },
  methods: {}
}
</script>

<template>
  <div class="customs-details">
    <!-- 列表页 -->
    <base-page
      ref="customsDetailsRef"
      :name="constant.TABLE_NAME_CUS_HI_PRICE_CUSTOMS_DETAILS"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :show-checkbox="false"
      :buttons-config="buttonsConfig"
    />
  </div>
</template>

<!-- 历史价格库 -->
<script>
import { getCustomsHiPrice } from '@/api/customs/customs-hi-price'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import Drawer from './components/drawer'

export default {
  name: 'CustomsHiPrice',
  components: { Drawer },
  data() {
    return {
      constant,
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCustomsHiPrice({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      details: {
        visible: false,
        title: ''
      },
      columns: [
        { field: 'productModel', title: '型号', searchProps: true },
        { field: 'productBrand', title: '品牌', searchProps: true },
        {
          field: 'month',
          title: '月数',
          searchProps: { type: 'select' }
        },
        {
          field: 'ieFlag',
          title: '进出口标志',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'currencyName', title: '币别' },
        { field: 'productUnit', title: '单位' },
        {
          field: 'avgPrice',
          title: '平均价',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'minPrice',
          title: '最低价',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'maxPrice',
          title: '最高价',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
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
      show: this.permissions[constant.PERMISSION_CUS_HI_PRICE],
      mark: constant.PERMISSION_CUS_HI_PRICE
    }
    this.buttonsConfig = {}
  },
  methods: {
    openDetails({ row }) {
      this.tableRow = row
      this.details = {
        visible: true,
        title: ''
      }
    }
  }
}
</script>

<template>
  <div class="customs-hi-price">
    <!-- 列表页 -->
    <base-page
      ref="customsHiPriceRef"
      :name="constant.TABLE_NAME_CUS_HI_PRICE"
      :columns="columns"
      :request="request"
      :search-config="{
        labelWidth: '105px'
      }"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow"></drawer>
  </div>
</template>

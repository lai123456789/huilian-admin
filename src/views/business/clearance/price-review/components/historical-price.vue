<script>
import { getCustomsMasterDetail } from '@/api/customs/customs-master-detail'
import { getCustomsHiPrice } from '@/api/customs/customs-hi-price'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import dayjs from '@/utils/day'

export default {
  name: 'HistoricalPrice',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderType: String,
    tableRow: Object,
    mainRow: Object,
    reLoad: Function
  },
  data() {
    return {
      constant,
      visible: this.value,
      tableData: [],
      request: null,
      detailsColumns: [
        { field: 'declareDate', title: '申报日期' },
        { field: 'contrNo', title: '合同协议号' },
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
        { field: 'customsTotal', title: '报关总价' },
        { field: 'tradeCurr', title: '币制' },
        { field: 'originCountry', title: '原产国(地区)' }
      ],
      params: {},
      showPage: false
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.handleHistoricalPriceData()
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    async handleHistoricalPriceData() {
      this.showPage = false
      const defaultConfigRes = await publicValueSysPublicParamByPublicKey(constant.PARAMS_ABNORMAL_PRICE_SCOPE)
      this.defaultConfig = defaultConfigRes.data
      const { productBrand, productModel, productUnit } = this.mainRow
      const { currencyName } = this.tableRow
      const res = await getCustomsHiPrice({
        month: this.getStringByNumber(this.defaultConfig.statisticalMonth),
        size: -1,
        ieFlag:
          this.type === enums.ORDER_TYPE.getFieldByKey('IMPORT')
            ? enums.IEF_LAG.getFieldByKey('IMPORT')
            : enums.IEF_LAG.getFieldByKey('EXPORT'),
        productBrand,
        productModel,
        currencyName,
        productUnit
      })

      const arr = []
      for (let i = 0; i < this.defaultConfig.statisticalMonth; i++) {
        const item = { monthStr: '', month: i + 1, minPrice: 0, maxPrice: 0, avgPrice: 0 }

        item.monthStr = this.formatterRecentMonth(i)

        const obj = res.data.records.find(v => v.month === i + 1)
        arr.push(Object.assign(item, obj || {}))
      }

      this.tableData = arr

      this.$refs.historicalPriceRef.setRadioRow(this.tableData[0], true)

      this.params = {
        ieFlag:
          this.type === enums.ORDER_TYPE.getFieldByKey('IMPORT')
            ? enums.IEF_LAG.getFieldByKey('IMPORT')
            : enums.IEF_LAG.getFieldByKey('EXPORT'),
        declareStatus: '4', // TODO 这里的申报状态对不上,可能是当前跟后台约定的 -> 申报成功
        declareDate: `${dayjs().subtract(this.tableData[0].month, 'month').format('YYYY-MM-DD')},${dayjs()
          .subtract(1, 'day')
          .format('YYYY-MM-DD')}`,
        productBrand: productBrand || ' ',
        productModel: productModel || ' ',
        currencyName: currencyName || ' ',
        gUnit: productUnit || ' '
      }

      this.request = async ({ pager, params }) => {
        const { data } = await getCustomsMasterDetail({
          ...pager,
          ...transforArrayPayload(Object.assign(this.params, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      }

      this.showPage = true
    },
    handleRadioChange({ row }) {
      this.params.declareDate = `${dayjs().subtract(row.month, 'month').format('YYYY-MM-DD')},${dayjs()
        .subtract(1, 'day')
        .format('YYYY-MM-DD')}`
      this.$nextTick(() => {
        this.$refs.PageRef.refresh(false)
      })
    },
    formatterRecentMonth(month) {
      let monthStr = ''
      switch (month + 1) {
        case 1:
          monthStr = '近一月'
          break
        case 2:
          monthStr = '近二月'
          break
        case 3:
          monthStr = '近三月'
          break
        case 4:
          monthStr = '近四月'
          break
        case 5:
          monthStr = '近五月'
          break
        case 6:
          monthStr = '近六月'
          break
        case 7:
          monthStr = '近七月'
          break
        case 8:
          monthStr = '近八月'
          break
        case 9:
          monthStr = '近九月'
          break
        case 10:
          monthStr = '近十月'
          break
        case 11:
          monthStr = '近十一月'
          break
        case 12:
          monthStr = '近十二月'
          break
      }
      return monthStr
    },
    getStringByNumber(num = 0) {
      const arr = []
      for (let i = 1; i <= num; i++) {
        arr.push(i)
      }
      return arr.join(',')
    }
  }
}
</script>

<template>
  <base-dialog custom-class="historical-price-dialog" fullscreen :visible.sync="visible" title="查看历史价格" :show-footer="false">
    <div class="historical-price">
      <div class="wait-page">
        <el-card class="box-card" header="历史价格">
          <vxe-table
            ref="historicalPriceRef"
            border
            height="auto"
            size="mini"
            show-overflow
            :radio-config="{ trigger: 'row', highlight: true }"
            :data="tableData"
            @radio-change="handleRadioChange"
          >
            <vxe-column type="radio" width="50"></vxe-column>
            <vxe-column field="monthStr" title="月数"></vxe-column>
            <vxe-column field="avgPrice" title="平均价"></vxe-column>
            <vxe-column field="minPrice" title="最低价"></vxe-column>
            <vxe-column field="maxPrice" title="最高价"></vxe-column>
            <template #empty>
              <base-empty />
            </template>
          </vxe-table>
        </el-card>
      </div>
      <div class="select-page">
        <el-card class="box-card" header="报关明细">
          <base-page
            v-if="showPage"
            ref="PageRef"
            :name="constant.TABLE_NAME_PRICE_REVIEW_IMPORT_CUSTOMS_DETAILS"
            :reserve="true"
            :tools-config="{
              setting: {
                visible: false
              },
              download: {
                visible: false
              }
            }"
            :columns="detailsColumns"
            :request="request"
          />
        </el-card>
      </div>
    </div>
  </base-dialog>
</template>

<style lang="scss">
.historical-price-dialog {
  .historical-price {
    height: 100%;
    .el-card {
      height: 100%;
    }
    .el-card__header {
      padding: 12px 15px;
    }
    .el-card__body {
      padding: 0;
      height: calc(100% - 46px);
    }
  }
  .wait-page {
    display: inline-block;
    padding-right: 10px;
    width: 34%;
    height: 100%;
    box-sizing: border-box;
    .el-card__body {
      padding: 10px;
    }
  }
  .select-page {
    display: inline-block;
    width: 66%;
    height: 100%;
    box-sizing: border-box;
    vertical-align: top;
    .el-card__body {
      padding: 10px 0;
    }
  }
}
</style>

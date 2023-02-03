<!-- 进口审价 -->
<script>
import { getOrderImportHiPrice, resetHiPriceOrderImportHiPrice } from '@/api/order/order-import-hi-pirce'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresOrder } from '@/utils/jump'
import Drawer from './components/drawer'
import EnterFormHiPrice from './components/enter-form-hi-price'

export default {
  name: 'ImportHiPircer',
  components: { Drawer, EnterFormHiPrice },
  data() {
    return {
      enums,
      constant,
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getOrderImportHiPrice({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      details: {
        visible: false,
        title: ''
      },
      hiPriceEnterForm: {
        visible: false,
        title: '',
        row: {}
      },
      columns: [
        {
          field: 'hiPriceStatus',
          title: '审价状态',
          color: value => {
            return enums.HI_PRICE_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_HI_PRICE_STATUS)
            }
          },
          render: (h, value, row, column, options) => {
            const target = options.find(v => v.value === value)
            const text = `${target ? target.label : value}(${row.hiPriceNum})`
            return <div style={{ color: enums.HI_PRICE_STATUS.getFieldByValue(value, 'color') }}>{text}</div>
          },
          renderText: (value, row, column, options) => {
            const target = options.find(v => v.value === value)
            const text = `${target ? target.label : value}(${row.hiPriceNum})`
            return text
          }
        },
        { field: 'hiPriceUser', title: '处理人' },
        { field: 'hiPriceRemark', title: '审价备注' },
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        },
        { field: 'orderDate', title: '订单日期', searchProps: { type: 'date', sort: 1 } },
        {
          field: 'orderNo',
          title: '订单编号',
          searchProps: true,
          link: row => jumpCorresOrder(row, this, enums.ORDER_TYPE.getFieldByKey('IMPORT'))
        },
        { field: 'contrNo', title: '合同协议号', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: true } },
        { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'supplierName', title: '供应商名称', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: 'companyName' } },
        { field: 'currencyName', title: '报关币别' },
        {
          field: 'price',
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
          field: 'totalMoney',
          title: '报关总价',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'tradeManName', title: '商务名称' },
        { field: 'remark', title: '备注' },
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
      show: this.permissions[constant.PERMISSION_PRICE_REVIEW_IMPORT],
      mark: constant.PERMISSION_PRICE_REVIEW_IMPORT
    }
    this.buttonsConfig = {
      mores: [
        {
          label: '重置审价',
          visible: this.permissions[constant.PERMISSION_PRICE_REVIEW_IMPORT_SHENJIA],
          handler: row => this.handleReviewPrice(row)
        },
        {
          label: '审价通过',
          visible: this.permissions[constant.PERMISSION_PRICE_REVIEW_IMPORT_PASS],
          type: 'success',
          handler: row => this.handlePass(row)
        },
        {
          label: '审价不通过',
          visible: this.permissions[constant.PERMISSION_PRICE_REVIEW_IMPORT_ROLLBACK],
          type: 'danger',
          handler: row => this.handleRollback(row)
        }
      ]
    }
  },
  methods: {
    handlePass(rows) {
      this.hiPriceEnterForm = {
        visible: true,
        title: '审价通过',
        row: {
          hiPriceStatus: enums.HI_PRICE_STATUS.getFieldByKey('APPRAISAL_PASSED'),
          orderId: rows[0].id
        }
      }
    },
    handleRollback(rows) {
      this.hiPriceEnterForm = {
        visible: true,
        title: '审价不通过',
        row: {
          hiPriceStatus: enums.HI_PRICE_STATUS.getFieldByKey('PRICE_REVIEW_FAILED'),
          orderId: rows[0].id
        }
      }
    },
    async handleReviewPrice(rows) {
      const { id } = rows[0]
      await resetHiPriceOrderImportHiPrice(id)
      this.$message.success('审价成功')
      this.reLoad(false)
    },
    openDetails({ row }) {
      const { orderNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: orderNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['importHiPircerRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="import-hi-pircer">
    <!-- 列表页 -->
    <base-page
      ref="importHiPircerRef"
      :name="constant.TABLE_NAME_PRICE_REVIEW_IMPORT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :search-config="{
        labelWidth: '105px'
      }"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer
      :visible.sync="details.visible"
      :order-type="enums.ORDER_TYPE.getFieldByKey('IMPORT')"
      :title="details.title"
      :table-row="tableRow"
      :re-load="reLoad"
    ></drawer>
    <enter-form-hi-price
      v-model="hiPriceEnterForm.visible"
      :title="hiPriceEnterForm.title"
      :order-type="enums.ORDER_TYPE.getFieldByKey('IMPORT')"
      :table-row="hiPriceEnterForm.row"
      :re-load="reLoad"
    />
  </div>
</template>

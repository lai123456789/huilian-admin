<!--  退税申报 -- 订单收票 -->
<script>
import { getAcctReceiveInvoice } from '@/api/finance/acct-receive-invoice'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'OrderInvoice',
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    detailsMark: Boolean
  },
  data() {
    return {
      constant,
      details: {
        visible: false,
        title: ''
      },
      request: async ({ pager, params }) => {
        const { data } = await getAcctReceiveInvoice({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                taxRefundId: this.tableRow.id
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
        {
          field: 'functionCallStatus',
          title: '函调状态',
          color: value => {
            return enums.FUNCTION_CALL_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_FUNCTION_CALL_STATUS)
            }
          }
        },
        { field: 'taxRefundNo', title: '退税申报编号', searchProps: true },
        {
          field: 'taxInvoiceNo',
          title: '进项票编号',
          searchProps: true,
          link: { name: constant.ROUTE_INPUT_TICKET, toField: 'taxInvoiceNo' }
        },
        { field: 'sendLetterDate', title: '发函时间' },
        { field: 'replyDate', title: '回函日期' },
        {
          field: 'serviceTaxFlag',
          title: '发票类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SERVICE_TAX_FLAG)
            }
          }
        },
        { field: 'taxDate', title: '税票日期' },
        { field: 'taxNo', title: '发票号码' },
        { field: 'taxCode', title: '发票代码' },
        { field: 'supplierName', title: '开票供应商', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: 'companyName' } },
        { field: 'totalMoney', title: '开票总金额', sum: true, align: 'right' },
        {
          field: 'taxRate',
          title: '税率',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TAX_RATE)
            }
          }
        },
        { field: 'cargoMoney', title: '货款', sum: true, align: 'right' },
        { field: 'taxMoney', title: '税额', sum: true, align: 'right' },
        { field: 'remark', title: '开票备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {},
  methods: {}
}
</script>

<template>
  <div class="order-invoice">
    <!-- 列表页 -->
    <base-page
      ref="orderInvoiceRef"
      :name="constant.TABLE_NAME_TAX_DECLARE_ORDER_INVOICE"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
      show-footer
      :search-config="{
        labelWidth: '105px'
      }"
    />
  </div>
</template>

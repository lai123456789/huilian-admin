<!-- 应收类目 -->
<script>
import { getAcctCostInvoice, deleteAcctCostInvoiceByIds } from '@/api/finance/acct-cost-invoice'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import EnterFormInvoSettleAdvance from './components/enter-form-bank'
import jump from '@/utils/jump'

export default {
  name: 'CostInvoice',
  components: { EnterFormInvoSettleAdvance },
  props: {
    tableRow: Object,
    permissionsCostInvoice: Object
  },
  data() {
    return {
      constant,
      settleAdvance: {
        visible: false,
        row: {}
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctCostInvoice({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                orderId: this.tableRow.id,
                orderType: this.tableRow.orderType
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
        { field: 'costNo', title: '应收编号', searchProps: true, link: { name: constant.ROUTE_ACCT_COST_INVOICE, toField: true } },
        {
          field: 'verifyStatus',
          title: '核销状态',
          color: value => {
            return enums.VERIFY_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select',
            attrs: {
              multiple: true
            }
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_VERIFY_STATUS)
            }
          }
        },
        {
          field: 'orderType',
          title: '订单类型',
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
            }
          }
        },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        {
          field: 'payCompanyType',
          title: '付款方类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PAY_COMPANY_TYPE)
            }
          }
        },
        {
          field: 'payCompanyName',
          title: '付款方名称',
          searchProps: true,
          link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' }
        },
        {
          field: 'costType',
          title: '费用大类',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COST_TYPE)
            }
          }
        },
        { field: 'costName', title: '费用名称', searchProps: true },
        { field: 'costDate', title: '费用发生日期', searchProps: { type: 'date', sort: 1 } },
        { field: 'costCurrency', title: '费用币别' },
        {
          field: 'costMoney',
          title: '费用金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'settleDate', title: '应收日期' },
        { field: 'settleCurrency', title: '应收币别' },
        { field: 'settleRate', title: '结算汇率' },
        { field: 'feeTax', title: '费用税点' },
        {
          field: 'settleMoney',
          title: '应收金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'verifyMoney',
          title: '已收金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'remark', title: '备注' },
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
      add: {
        visible: this.permissions[this.permissionsCostInvoice.add],
        handler: this.handleAdded
      },
      del: {
        visible: this.permissions[this.permissionsCostInvoice.del],
        multiple: true,
        handler: this.handleDel
      },
      mores: [
        // {
        //   label: '结算账期',
        //   handler: this.handleSettleAdvance,
        //   visible: this.permissions[this.permissionsCostInvoice.jszq]
        // },
        {
          label: '更多操作',
          handler: this.handleMoreOpera,
          noNeedRows: true,
          visible: true
        }
      ]
    }
  },
  methods: {
    handleSettleAdvance(rows) {
      this.settleAdvance = {
        visible: true,
        row: rows[0]
      }
    },
    handleAdded() {
      jump(this, constant.ROUTE_ACCT_COST_INVOICE, {
        acctCostInvoiceAdd: this.tableRow
      })
    },
    handleMoreOpera() {
      // 根据订单编号筛选的
      jump(this, constant.ROUTE_ACCT_COST_INVOICE, { orderNo: this.tableRow.orderNo, filtersMark: true })
    },
    handleDel(rows) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctCostInvoiceByIds(rows.map(row => row.id)).then(() => {
            // 清空表格全部选中的数据
            this.$refs['costInvoiceRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['costInvoiceRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cost-invoice">
    <!-- 列表页 -->
    <base-page
      ref="costInvoiceRef"
      :name="constant.TABLE_NAME_COMMON_ACCT_COST_INVO"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '125px'
      }"
    />
    <enter-form-invo-settle-advance v-model="settleAdvance.visible" :table-row="settleAdvance.row" :re-load="reLoad" />
  </div>
</template>

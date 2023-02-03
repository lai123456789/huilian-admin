<!-- 进口票差 -->
<script>
import { getAcctMakeInvoiceDiff } from '@/api/finance/acct-make-invoice-diff'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresOrder } from '@/utils/jump'
import Drawer from './components/drawer'

export default {
  name: 'MakeInvoiceDiff',
  components: { Drawer },
  data() {
    return {
      constant,
      details: {
        visible: false,
        title: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctMakeInvoiceDiff({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'deductStatus',
          title: '抵扣状态',
          color: value => {
            return enums.DEDUCT_STATUS.getFieldByValue(value, 'color')
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
              options: () => getDataDictionary(constant.DICTS_DEDUCT_STATUS)
            }
          }
        },
        { field: 'invoiceDiffNo', title: '票差编号', searchProps: true },
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
        {
          field: 'orderNo',
          title: '订单编号',
          searchProps: true,
          link: row => jumpCorresOrder(row, this)
        },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        {
          field: 'unDeductMoney',
          title: '未抵扣票差金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'deductMoney',
          title: '已抵扣票差金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'totalMoney',
          title: '票差金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'beforeInvoiceMoney',
          title: '提前开票金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'costInvoiceMoney',
          title: '实际应收金额',
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
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_IMPORT_TICKET_DIFF],
      mark: constant.PERMISSION_IMPORT_TICKET_DIFF
    }
    this.buttonsConfig = {}
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    openDetails({ row }) {
      const { invoiceDiffNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: invoiceDiffNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['makeInvoiceDiffRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="make-invoice-diff">
    <!-- 列表页 -->
    <base-page
      ref="makeInvoiceDiffRef"
      :name="constant.TABLE_NAME_IMPORT_TICKET_DIFF"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      show-footer
      :search-config="{
        labelWidth: '105px'
      }"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad"></drawer>
  </div>
</template>

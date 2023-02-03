<!-- 销项票 -->
<script>
import { getAcctMakeInvoice, deleteAcctMakeInvoiceById } from '@/api/finance/acct-make-invoice'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import { isFunction } from 'xe-utils'

export default {
  name: 'MakeInvoice',
  components: { EnterForm, Drawer },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      },
      details: {
        visible: false,
        title: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctMakeInvoice({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'auditStatus',
          title: '审核状态',
          color: value => {
            return enums.AUDIT_STATUS.getFieldByValue(value, 'color')
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
              options: () => getDataDictionary(constant.DICTS_AUDIT_STATUS)
            }
          }
        },
        { field: 'taxInvoiceNo', title: '发票编号', searchProps: true },
        {
          field: 'invoiceStatus',
          title: '开票状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_INVOICE_TYPE)
            }
          }
        },
        {
          field: 'invoiceMakeType',
          title: '发票类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SERVICE_TAX_FLAG)
            }
          }
        },
        {
          field: 'invoiceType',
          title: '发票开具类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_INVOICE_TYPE)
            }
          }
        },
        {
          field: 'beforeFlag',
          title: '是否提前开票',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'rate', title: '提前开票汇率' },
        { field: 'orderNo', title: '订单编号', searchProps: true, visible: false },
        { field: 'customerName', title: '客户名称', searchProps: true },
        { field: 'invoiceTitle', title: '发票抬头' },
        { field: 'bankName', title: '开户银行名称' },
        { field: 'bankNo', title: '开户银行账号' },
        { field: 'registerAddress', title: '注册场所地址' },
        { field: 'registerTel', title: '注册固定电话' },
        { field: 'creditCode', title: '纳税识别号' },
        {
          field: 'totalMoney',
          title: '开票总金额',
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
      show: this.permissions[constant.PERMISSION_SALES_TICKET],
      mark: constant.PERMISSION_SALES_TICKET
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SALES_TICKET_ADD],
        handler: this.handleAdded
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SALES_TICKET_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },

    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctMakeInvoiceById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['makeInvoiceRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
            // 第二个参数可能是在page组件下的buttons组件里面定义的loading状态对象，因此需要判断是否为函数
            if (cb && isFunction(cb)) {
              cb()
            }
          })
        })
        .catch(() => {})
    },
    openDetails({ row }) {
      const { taxInvoiceNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: taxInvoiceNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['makeInvoiceRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="make-invoice">
    <!-- 列表页 -->
    <base-page
      ref="makeInvoiceRef"
      :name="constant.TABLE_NAME_SALES_TICKET"
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
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>

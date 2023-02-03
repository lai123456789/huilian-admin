<!-- 付款单 -->
<script>
import { getAcctPayment, deleteAcctPaymentById } from '@/api/finance/acct-payment'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresCompany } from '@/utils/jump'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import dayjs from '@/utils/day'
import { isFunction } from 'xe-utils'

export default {
  name: 'Payment',
  components: { Drawer, EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        rows: [],
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      },
      details: {
        visible: false,
        title: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctPayment({ ...pager, ...transforArrayPayload(params) })
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
        {
          field: 'payStatus',
          title: '付款状态',
          color: value => {
            return enums.PAY_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PAY_STATUS)
            }
          }
        },
        {
          field: 'verifyStatus',
          title: '核销状态',
          color: value => {
            return enums.VERIFY_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_VERIFY_STATUS)
            }
          }
        },
        { field: 'payNo', title: '付款单编号', searchProps: true },
        { field: 'customerName', title: '委托客户', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        {
          field: 'receiptCompanyType',
          title: '收款方类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PAY_COMPANY_TYPE)
            }
          }
        },
        {
          field: 'receiptCompanyName',
          title: '收款方名称',
          searchProps: true,
          link: row => jumpCorresCompany(row, this, 'receiptCompanyType', 'receiptCompanyName')
        },
        {
          field: 'payUse',
          title: '款项用途',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PAY_USE)
            }
          }
        },
        { field: 'applyPayDate', title: '申请付款日期', searchProps: { type: 'date', sort: 1 } },
        { field: 'payDate', title: '实际付款日期' },
        { field: 'payCurrency', title: '付款币别' },
        {
          field: 'payMoney',
          title: '付款金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'payCharge',
          title: '手续费',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'verifyMoney',
          title: '核销金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'payRate', title: '付款汇率' },
        {
          field: 'chargeBearType',
          title: '手续费承担方式',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_CHARGE_BEAR_TYPE)
            }
          }
        },
        { field: 'principalName', title: '付款主体', searchProps: true, link: { name: constant.ROUTE_COMPANY, toField: 'companyName' } },
        { field: 'payBankName', title: '付款银行名称' },
        { field: 'payAccount', title: '付款银行账号' },
        { field: 'serialNumber', title: '银行流水号' },
        { field: 'receiptBankName', title: '收款银行名称' },
        { field: 'receiptAccount', title: '收款银行账号' },
        { field: 'receiptSwiftCode', title: '收款银行SWIFT' },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' },
        { field: 'orderNo', title: '订单编号', searchProps: true, visible: false },
        { field: 'costPayNo', title: '应付编号', searchProps: true, visible: false }
      ],
      buttonsConfig: {},
      helpConfig: {},
      nearlyMonths: [dayjs().subtract(1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_PAY_ORDER],
      mark: constant.PERMISSION_PAY_ORDER
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_PAY_ORDER_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_PAY_ORDER_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_PAY_ORDER_DEL],
        handler: this.handleDel
      }
    }

    // 在应付类目跳转过来带选中ids数据过来
    const { openPaymentOrderAdded } = this.$route.params
    if (openPaymentOrderAdded) {
      const { rows } = openPaymentOrderAdded
      this.$nextTick(() => {
        this.enterForm = {
          visible: true,
          rows,
          type: enums.FORM_TYPE.getFieldByKey('ADDED')
        }
      })
    }
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        rows: [],
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.tableRow = row
      this.enterForm = {
        visible: true,
        rows: [],
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctPaymentById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['paymentRef'].handleTableClearCheckbox(true)
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
      const { payNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: payNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['paymentRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="payment">
    <!-- 列表页 -->
    <base-page
      ref="paymentRef"
      :name="constant.TABLE_NAME_PAY_ORDER"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      show-footer
      :search-config="{
        labelWidth: '105px',
        form: {
          applyPayDate: nearlyMonths
        }
      }"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form
      ref="enterFormRef"
      v-model="enterForm.visible"
      :type="enterForm.type"
      :rows="enterForm.rows"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>

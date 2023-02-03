<!-- 收证 -->
<script>
import { getAcctLetterOfCreditReceipt, deleteAcctLetterOfCreditReceiptById } from '@/api/finance/acct-letter-of-credit-receipt'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import { isFunction } from 'xe-utils'

export default {
  name: 'AcctCreditReceipt',
  components: { EnterForm, Drawer },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctLetterOfCreditReceipt({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'creditType',
          title: '信用证类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_CREDIT_TYPE)
            }
          }
        },
        { field: 'creditNo', title: '信用证号' },
        { field: 'issuingBankName', title: '开证行' },
        { field: 'issuingDate', title: '开证日期' },
        { field: 'receiptDate', title: '收证日期' },
        { field: 'contractNo', title: '合同号' },
        { field: 'applicantCompanyName', title: '申请人名称' },
        { field: 'applicantAddress', title: '申请人地址' },
        { field: 'applicantCountry', title: '申请人国家地区' },
        {
          field: 'beneficiaryCompanyType',
          title: '受益人类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: async () => {
                const data = await getDataDictionary(constant.DICTS_PAY_COMPANY_TYPE)
                return data.filter(v => ![enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS')].includes(v.value))
              }
            }
          }
        },
        { field: 'beneficiaryCompanyName', title: '	受益人名称' },
        { field: 'beneficiaryAddress', title: '受益人地址' },
        { field: 'beneficiaryCountry', title: '受益人国家地区' },
        { field: 'currencyName', title: '币别' },
        {
          field: 'creditMoney',
          title: '金额',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'deliveryEndDate', title: '交单期限结束时间' },
        { field: 'deliveryStartDate', title: '交单期限开始时间' },
        { field: 'russianSea', title: '起运港' },
        { field: 'destPort', title: '目的港' },
        { field: 'dischargePort', title: '卸货港' },
        { field: 'expiryDate', title: '有效期' },
        { field: 'expiryPlace', title: '有效期限地址' },
        { field: 'shipmentDate', title: '最迟装期' },
        { field: 'shippingCountry', title: '货运国家地区' },
        { field: 'shippingDesc', title: '货运描述' },
        { field: 'transModeName', title: '运输方式' },
        {
          field: 'usanceFlag',
          title: '是否远期',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_USANCE_FLAG)
            }
          }
        },
        { field: 'usanceDay', title: '远期天数' },
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
      show: this.permissions[constant.PERMISSION_ACCT_CREDIT_RECEIPT],
      mark: constant.PERMISSION_ACCT_CREDIT_RECEIPT
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_ACCT_CREDIT_RECEIPT_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_ACCT_CREDIT_RECEIPT_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_ACCT_CREDIT_RECEIPT_DEL],
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
    handleEdit(row) {
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctLetterOfCreditReceiptById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['acctCreditReceiptRef'].handleTableClearCheckbox(true)
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
      const { contractNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: contractNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['acctCreditReceiptRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="acct-credit-receipt">
    <!-- 列表页 -->
    <base-page
      ref="acctCreditReceiptRef"
      :name="constant.TABLE_NAME_ACCT_CREDIT_RECEIPT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :search-config="{
        labelWidth: '105px'
      }"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>

<!-- 收款单 -->
<script>
import { getAcctReceipt, deleteAcctReceiptById, acctReceiptImportUrl, acctReceiptExportUrl } from '@/api/finance/acct-receipt'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresCompany } from '@/utils/jump'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import EnterFormClaimPay from './components/enter-form-claim-pay'
import EnterFormClaimSettle from './components/enter-form-claim-settle'
import dayjs from '@/utils/day'
import { isFunction } from 'xe-utils'

export default {
  name: 'Receipt',
  components: { EnterForm, Drawer, EnterFormClaimPay, EnterFormClaimSettle },
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
      claimPay: {
        visible: false,
        rows: []
      },
      claimSettle: {
        visible: false,
        rows: []
      },
      downloadConfig: {
        url: acctReceiptExportUrl,
        params: {},
        fileName: '收款单模板'
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctReceipt({ ...pager, ...transforArrayPayload(params) })
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
        {
          field: 'verifyPayStatus',
          title: '付汇状态/结汇状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIPT_PAY_STATUS)
            }
          },
          render: (h, value, row) => {
            let text = ''
            if (row.receiptUse) {
              if (row.receiptUse === enums.RECEIPT_USE.getFieldByKey('PAYMENT')) {
                text = enums.RECEIPT_PAY_STATUS.getFieldByValue(value).split('/')[0]
              } else if (row.receiptUse === enums.RECEIPT_USE.getFieldByKey('SOE')) {
                text = enums.RECEIPT_PAY_STATUS.getFieldByValue(value).split('/')[1]
              }
            }
            return <div style={{ color: enums.RECEIPT_PAY_STATUS.getFieldByValue(value, 'color') }}>{text}</div>
          },
          renderText: (value, row) => {
            let text = ''
            if (row.receiptUse) {
              if (row.receiptUse === enums.RECEIPT_USE.getFieldByKey('PAYMENT')) {
                text = enums.RECEIPT_PAY_STATUS.getFieldByValue(value).split('/')[0]
              } else if (row.receiptUse === enums.RECEIPT_USE.getFieldByKey('SOE')) {
                text = enums.RECEIPT_PAY_STATUS.getFieldByValue(value).split('/')[1]
              }
            }
            return text
          }
        },
        { field: 'receiptNo', title: '收款单号', searchProps: true },
        {
          field: 'payCompanyType',
          title: '付款方类型',
          searchProps: true,
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
          link: row => jumpCorresCompany(row, this, 'payCompanyType', 'payCompanyName')
        },
        {
          field: 'receiptUse',
          title: '款项用途',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIPT_USE)
            }
          }
        },
        { field: 'receiptDate', title: '收款日期', searchProps: { type: 'datetime', sort: 1 } },
        {
          field: 'receiptMode',
          title: '收款方式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIPT_MODE)
            }
          }
        },
        { field: 'receiptCurrency', title: '收款币别' },
        {
          field: 'receiptMoney',
          title: '收款金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'receiptCharge',
          title: '手续费',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'chargeBearType',
          title: '手续费承担方式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_CHARGE_BEAR_TYPE)
            }
          }
        },
        {
          field: 'lockMoney',
          title: '锁定金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'settleMoney',
          title: '核销金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'verifyMoney',
          title: '已核销金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'verifyPayMoney',
          title: '已付汇金额/已结汇金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'receiptRate', title: '收款汇率' },
        {
          field: 'principalName',
          title: '收款主体名称',
          searchProps: true,
          link: { name: constant.ROUTE_COMPANY, toField: 'companyName' }
        },
        { field: 'receiptBankName', title: '收款银行名称' },
        { field: 'receiptAccount', title: '收款银行账号' },
        { field: 'serialNumber', title: '银行流水号' },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' },
        { field: 'orderNo', title: '订单编号', searchProps: true, visible: false },
        { field: 'costInvoiceNo', title: '应收编号', searchProps: true, visible: false }
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
      show: this.permissions[constant.PERMISSION_ACCT_RECEIPT],
      mark: constant.PERMISSION_ACCT_RECEIPT
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_ACCT_RECEIPT_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_ACCT_RECEIPT_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_ACCT_RECEIPT_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '导入',
          visible: this.permissions[constant.PERMISSION_ACCT_RECEIPT_IMPORT],
          render: () => {
            return (
              <business-import-button
                action={acctReceiptImportUrl}
                download-config={this.downloadConfig}
                onResult={this.handleImportResult}
              />
            )
          }
        },
        {
          label: '认领付汇',
          visible: this.permissions[constant.PERMISSION_ACCT_RECEIPT_CLAIM_PAY],
          multiple: true,
          handler: this.handleClaimPay
        },
        {
          label: '认领结汇',
          visible: this.permissions[constant.PERMISSION_ACCT_RECEIPT_CLAIM_SETTLE],
          multiple: true,
          handler: this.handleClaimSettle
        }
      ]
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
          deleteAcctReceiptById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['receiptRef'].handleTableClearCheckbox(true)
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
      const { receiptNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: receiptNo
      }
    },
    handleClaimPay(rows) {
      const payCompanyId = rows[0].payCompanyId
      const payCompanyType = rows[0].payCompanyType
      if (!rows.every(row => row.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) {
        return this.$message.error('请选择已审核的数据')
      }
      if (rows.every(row => row.verifyPayStatus === enums.RECEIPT_PAY_STATUS.getFieldByKey('SUCCESS'))) {
        return this.$message.error('请选择未付汇、部分付汇的数据')
      }
      if (!rows.every(row => row.receiptUse === enums.RECEIPT_USE.getFieldByKey('PAYMENT'))) {
        return this.$message.error('请选择款项用途为进口付汇的数据')
      }
      if (!rows.every(row => row.payCompanyId === payCompanyId)) return this.$message.error('请选择相同付款方的数据')
      if (!rows.every(row => row.payCompanyType === payCompanyType)) return this.$message.error('请选择相同付款方类型的数据')
      this.claimPay = {
        visible: true,
        rows
      }
    },
    handleClaimSettle(rows) {
      const payCompanyId = rows[0].payCompanyId
      const payCompanyType = rows[0].payCompanyType
      if (!rows.every(row => row.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) {
        return this.$message.error('请选择已审核的数据')
      }
      if (rows.every(row => row.verifyPayStatus === enums.RECEIPT_PAY_STATUS.getFieldByKey('SUCCESS'))) {
        return this.$message.error('请选择未结汇、部分结汇的数据')
      }

      if (!rows.every(row => row.receiptUse === enums.RECEIPT_USE.getFieldByKey('SOE'))) {
        return this.$message.error('请选择款项用途为出口结汇的数据')
      }
      if (!rows.every(row => row.payCompanyId === payCompanyId)) return this.$message.error('请选择相同付款方的数据')
      if (!rows.every(row => row.payCompanyType === payCompanyType)) return this.$message.error('请选择相同付款方类型的数据')
      this.claimSettle = {
        visible: true,
        rows
      }
    },
    handleImportResult(res, status, done) {
      if (status === 'success') {
        if (res.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
          this.$nextTick(() => {
            this.reLoad(false)
            this.$message.success('导入成功')
            done()
          })
        } else {
          if (res.data && res.data.length) {
            let msg = ''
            res.data.forEach(v => {
              msg += `第${v.lineNum}行, ${v.errors}; </br>`
            })
            this.$message.error({
              dangerouslyUseHTMLString: true,
              message: msg
            })
          } else {
            this.$message.error(res.msg)
          }
        }
      } else {
        this.$message.error('服务器异常,请联系管理员')
      }
    },
    reLoad(isClearSelect) {
      this.$refs['receiptRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="receipt">
    <!-- 列表页 -->
    <base-page
      ref="receiptRef"
      :name="constant.TABLE_NAME_ACCT_RECEIPT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      show-footer
      :search-config="{
        labelWidth: '105px',
        form: {
          receiptDate: nearlyMonths
        }
      }"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <enter-form-claim-pay v-model="claimPay.visible" :table-rows="claimPay.rows" :re-load="reLoad"></enter-form-claim-pay>
    <enter-form-claim-settle v-model="claimSettle.visible" :table-rows="claimSettle.rows" :re-load="reLoad"></enter-form-claim-settle>
  </div>
</template>

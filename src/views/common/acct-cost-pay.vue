<!-- 应付类目 -->
<script>
import { getAcctCostPay, deleteAcctCostPayByIds, acctCostPayImportUrl, acctCostPayExportUrl } from '@/api/finance/acct-cost-pay'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import jump from '@/utils/jump'
import EnterFormPay from './components/enter-form-pay'

export default {
  name: 'CostPay',
  components: { EnterFormPay },
  props: {
    tableRow: Object,
    permissionsCostPay: Object,
    businessType: String,
    detailsMark: Boolean
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        if (this.businessType) {
          params = Object.assign(params, {
            relationBillType: this.businessType,
            // 如果是物流下的费用大类写死的杂费
            costType:
              this.businessType === enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATIONTRANSPORTATION')
                ? enums.COST_TYPE.getFieldByKey('VARIED')
                : void 0
          })
        }
        const { data } = await getAcctCostPay({
          ...pager,
          ...transforArrayPayload(Object.assign({ orderId: this.tableRow.id, orderType: this.tableRow.orderType }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'costNo', title: '应付编号', searchProps: true, link: { name: constant.ROUTE_ACCT_COST_PAY, toField: true } },
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
          searchProps: true
        },
        { field: 'customerName', title: '付款客户' },
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
          link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' }
        },
        {
          field: 'principalName',
          title: '付款主体名称',
          searchProps: true,
          link: { name: constant.ROUTE_COMPANY, toField: 'companyName' },
          visible: this.businessType
        },
        {
          field: 'relationBillType',
          title: '关联单据类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RELATION_BILL_TYPE)
            }
          },
          visible: this.businessType
        },
        { field: 'relationBillNo', title: '关联单据号', link: this.jumpRelationBillNo, visible: this.businessType },
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
        { field: 'settleDate', title: '应付日期' },
        { field: 'settleCurrency', title: '应付币别' },
        { field: 'settleRate', title: '结算汇率' },
        {
          field: 'settleMoney',
          title: '应付金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'verifyMoney',
          title: '已付金额',
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
      downloadConfig: {
        url: acctCostPayExportUrl,
        params: { relationBillType: this.businessType ? this.businessType : '' },
        fileName: '应付类目模板'
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      add: {
        visible: this.permissions[this.permissionsCostPay.add],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[this.permissionsCostPay.edit],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[this.permissionsCostPay.del],
        multiple: true,
        handler: this.handleDel
      },
      mores: [
        {
          label: '生成付款单',
          visible: this.permissions[this.permissionsCostPay.pay],
          multiple: true,
          handler: rows => this.jumpAddedpayOrder(rows)
        },
        {
          label: '导入',
          visible: !this.detailsMark && this.permissions[this.permissionsCostPay.import],
          render: () => {
            return (
              <business-import-button
                action={acctCostPayImportUrl}
                upload-data={{ relationBillType: this.businessType ? this.businessType : '' }}
                download-config={this.downloadConfig}
                onResult={this.handleImportResult}
              />
            )
          }
        }
      ]
    }
  },
  methods: {
    jumpRelationBillNo(row) {
      const routerName =
        row.relationBillType === enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATION')
          ? constant.ROUTE_CUSTOMS_DECLARATION
          : row.relationBillType === enums.RELATION_BILL_TYPE.getFieldByKey('PAYMENTDOC')
          ? constant.ROUTE_PAYMENT_ORDER
          : constant.ROUTE_HG_TRUCK
      const field =
        row.relationBillType === enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATION')
          ? 'contrNo'
          : row.relationBillType === enums.RELATION_BILL_TYPE.getFieldByKey('PAYMENTDOC')
          ? 'payNo'
          : 'transportNo'
      jump(this, routerName, { [field]: row['relationBillNo'], filtersMark: true })
    },
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(rows) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctCostPayByIds(rows.map(row => row.id).join(',')).then(() => {
            // 清空表格全部选中的数据
            this.$refs['costPayRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    jumpAddedpayOrder(rows) {
      // 只能选中未核销、收款方类型、收款方名称、付款客户相同的数据
      let receiptCompanyType
      let receiptCompanyName
      let customerName
      let settleCurrency
      let isPass = true
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].verifyStatus === enums.VERIFY_STATUS.getFieldByKey('ALL_VERIFY')) {
          this.$message.warning('请选择未核销或者部分核销的数据')
          isPass = false
          break
        }
        if (i === 0) {
          receiptCompanyType = rows[i].receiptCompanyType
          receiptCompanyName = rows[i].receiptCompanyName
          customerName = rows[i].customerName
          settleCurrency = rows[i].settleCurrency
        } else {
          if (receiptCompanyType !== rows[i].receiptCompanyType) {
            this.$message.warning('请选择相同的收款方类型的应付类目')
            isPass = false
            break
          }
          if (receiptCompanyName !== rows[i].receiptCompanyName) {
            this.$message.warning('请选择相同的收款方名称的应付类目')
            isPass = false
            break
          }
          if (customerName !== rows[i].customerName) {
            this.$message.warning('请选择相同的付款客户的应付类目')
            isPass = false
            break
          }
          if (settleCurrency !== rows[i].settleCurrency) {
            this.$message.warning('请选择相同的应付币别的应付类目')
            isPass = false
            break
          }
        }
      }
      if (!isPass) return
      // 跳转到付款单新增后，添加选中的数据
      jump(this, constant.ROUTE_PAYMENT_ORDER, { openPaymentOrderAdded: { rows } })
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
      this.$refs['costPayRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cost-pay">
    <!-- 列表页 -->
    <base-page
      ref="costPayRef"
      :name="constant.TABLE_NAME_COMMOM_ACCT_COST_PAY"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '120px'
      }"
    />
    <enter-form-pay
      v-model="enterForm.visible"
      :business-type="businessType"
      :type="enterForm.type"
      :main-row="mainRow"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>

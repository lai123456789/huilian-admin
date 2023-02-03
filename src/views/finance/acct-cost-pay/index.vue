<!-- 应付类目 -->
<script>
import { getAcctCostPay, acctCostPayImportUrl, acctCostPayExportUrl } from '@/api/finance/acct-cost-pay'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import enums from '@/enums'
import jump, { jumpCorresOrder } from '@/utils/jump'
import dayjs from '@/utils/day'

export default {
  name: 'CostPay',
  components: {},
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctCostPay({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'costNo', title: '应付编号', searchProps: true },
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
          searchProps: true,
          link: row => jumpCorresOrder(row, this)
        },
        {
          field: 'principalName',
          title: '付款主体',
          link: { name: constant.ROUTE_COMPANY, toField: 'companyName' }
        },
        { field: 'customerName', title: '委托客户', link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
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
      helpConfig: {},
      nearlyMonths: [dayjs().subtract(1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      downloadConfig: {
        url: acctCostPayExportUrl,
        params: { relationBillType: '' },
        fileName: '应付类目模板'
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_PAY_ORDER_ACC_COST],
      mark: constant.PERMISSION_PAY_ORDER_ACC_COST
    }

    this.buttonsConfig = {
      mores: [
        {
          label: '生成付款单',
          visible: this.permissions[constant.PERMISSION_PAY_ORDER_ACC_COST_JUMP],
          multiple: true,
          handler: this.jumpAddedpayOrder
        },
        {
          label: '导入',
          visible: this.permissions[constant.PERMISSION_PAY_ORDER_ACC_COST_IMPORT],
          render: () => {
            return (
              <business-import-button
                action={acctCostPayImportUrl}
                upload-data={{ relationBillType: '' }}
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
    jumpAddedpayOrder(rows) {
      // 只能选中未核销、收款方类型、收款方名称、付款客户相同的数据
      let receiptCompanyType
      let receiptCompanyName
      let customerName
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
        } else {
          if (receiptCompanyType !== rows[i].receiptCompanyType) {
            this.$message.warning('请选择相同的收款方类型')
            isPass = false
            break
          }
          if (receiptCompanyName !== rows[i].receiptCompanyName) {
            this.$message.warning('请选择相同的收款方名称')
            isPass = false
            break
          }
          if (customerName !== rows[i].customerName) {
            this.$message.warning('请选择相同的付款客户')
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
    }
  }
}
</script>

<template>
  <div class="cost-pay">
    <!-- 列表页 -->
    <base-page
      ref="costPayRef"
      :name="constant.TABLE_NAME_PAY_ORDER_ACC_COST"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      show-footer
      :search-config="{
        labelWidth: '105px',
        form: {
          costDate: nearlyMonths
        }
      }"
    />
  </div>
</template>

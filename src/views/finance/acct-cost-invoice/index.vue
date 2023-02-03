<!-- 应收类目 -->
<script>
import {
  getAcctCostInvoice,
  deleteAcctCostInvoiceByIds,
  acctCostInvoiceImportUrl,
  acctCostInvoiceExportUrl
} from '@/api/finance/acct-cost-invoice'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import jump, { jumpCorresOrder } from '@/utils/jump'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import dayjs from '@/utils/day'
import { isFunction } from 'xe-utils'

export default {
  name: 'CostInvoice',
  components: { Drawer, EnterForm },
  props: {
    businessType: String,
    buttonsObj: {
      type: Object,
      default: () => ({
        main: constant.PERMISSION_ACCT_COST_INVOICE,
        add: constant.PERMISSION_ACCT_COST_INVOICE_ADD,
        edit: constant.PERMISSION_ACCT_COST_INVOICE_EDIT,
        del: constant.PERMISSION_ACCT_COST_INVOICE_DEL,
        import: constant.PERMISSION_ACCT_COST_INVOICE_IMPORT
      })
    }
  },
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
      jumpObj: {
        mark: false,
        row: {}
      },
      downloadConfig: {
        url: acctCostInvoiceExportUrl,
        params: {
          relationBillType: this.businessType ? this.businessType : ''
        },
        fileName: '应收类目模板'
      },
      tableRow: {},
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
        const { data } = await getAcctCostInvoice({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [],
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
      show: this.permissions[this.buttonsObj.main],
      mark: this.buttonsObj.main
    }
    // 默认 付款单.  报关管理/仓储物流进入的 替换对应的按钮权限
    this.buttonsConfig = {
      add: {
        visible: this.permissions[this.buttonsObj.add],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[this.buttonsObj.edit],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[this.buttonsObj.del],
        multiple: true,
        handler: this.handleDel
      },
      mores: [
        {
          label: '导入',
          visible: this.permissions[this.buttonsObj.import],
          render: () => {
            return (
              <business-import-button
                action={acctCostInvoiceImportUrl}
                upload-data={{ relationBillType: this.businessType ? this.businessType : '' }}
                download-config={this.downloadConfig}
                onResult={this.handleImportResult}
              />
            )
          }
        }
      ]
    }

    const { acctCostInvoiceAdd } = this.$route.params

    if (acctCostInvoiceAdd) {
      this.$nextTick(() => {
        const { id: orderId, orderNo, orderType, customerName, customerCompanyId } = acctCostInvoiceAdd
        this.jumpOpenAdded({ orderId, orderNo, orderType, customerName, customerCompanyId })
      })
    }
  },
  methods: {
    handlePageBeforeLoad() {
      this.columns = [
        { field: 'costNo', title: '应收编号', searchProps: true },
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
        { field: 'orderNo', title: '订单编号', searchProps: true, link: row => jumpCorresOrder(row, this) },
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
          field: 'principalName',
          title: '收款主体名称',
          searchProps: true,
          link: { name: constant.ROUTE_COMPANY, toField: 'companyName' }
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
        {
          field: 'relationBillType',
          title: '关联单据类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RELATION_BILL_TYPE)
            }
          }
        },
        { field: 'relationBillNo', title: '关联单据号', searchProps: true, link: this.jumpRelationBillNo },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ]
      return Promise.resolve()
    },
    handleAdded() {
      this.jumpObj = {
        mark: false,
        row: {}
      }
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.jumpObj = {
        mark: false,
        row: {}
      }
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(rows, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctCostInvoiceByIds(rows.map(v => v.id).join(',')).then(() => {
            // 清空表格全部选中的数据
            this.$refs['costInvoiceRef'].handleTableClearCheckbox(true)
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
      const { costNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: costNo
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
    jumpOpenAdded(row) {
      this.jumpObj = {
        mark: true,
        row
      }
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
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
      :name="constant.TABLE_NAME_ACCT_COST_INVOICE"
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
      :before-load="handlePageBeforeLoad"
      @cell-dblclick="openDetails"
    />
    <drawer
      :business-type="businessType"
      :visible.sync="details.visible"
      :title="details.title"
      :table-row="tableRow"
      :re-load="reLoad"
      :delete-fn="handleDel"
    ></drawer>
    <enter-form
      ref="enterFormRef"
      v-model="enterForm.visible"
      :type="enterForm.type"
      :is-jump="jumpObj.mark"
      :jump-row="jumpObj.row"
      :table-row="tableRow"
      :re-load="reLoad"
      :business-type="businessType"
    />
  </div>
</template>

<script>
import { getAcctCostInvoiceById, saveAcctCostInvoice, updateAcctCostInvoice } from '@/api/finance/acct-cost-invoice'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  payCompanyType: enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMER'),
  payCompanyId: 0,
  payCompanyName: '',
  costName: '',
  costType: enums.COST_TYPE.getFieldByKey('VARIED'),
  orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT'),
  costDate: dayjs().format('YYYY-MM-DD'),
  orderNo: '',
  costCurrency: '',
  costMoney: 0,
  feeTax: '',
  settleCurrency: '',
  settleMoney: 0,
  settleDate: '',
  settleRate: 0,
  relationBillType: '',
  relationBillNo: '',
  remark: '',
  businessNo: ''
}

export default {
  name: 'EnterForm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    isJump: Boolean,
    jumpRow: Object,
    businessType: String
  },
  data() {
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        payCompanyName: [{ required: true, message: '付款方必填' }],
        orderNo: [{ required: true, message: '订单编号必填' }],
        settleCurrency: [{ required: true, message: '应收币别必填' }],
        costDate: [{ required: true, message: '费用发生日期必填' }],
        costType: [{ required: true, message: '费用大类必填' }],
        costCurrency: [{ required: true, message: '费用币别必填' }],
        relationBillNo: [{ required: !!this.businessType, message: '关联单据号必填' }]
      },
      dicts: {},
      orderTypes: []
    }
  },
  computed: {
    disabledByCostType() {
      return this.type !== enums.FORM_TYPE.getFieldByKey('ADDED') && this.form.costType !== enums.COST_TYPE.getFieldByKey('VARIED')
    },
    payCompanyModuleName() {
      let moduleName = constant.AUTOCOMPLETE_KEY_CUSTOMER
      switch (this.form.receiptCompanyType) {
        case enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMER'):
          moduleName = constant.AUTOCOMPLETE_KEY_CUSTOMER
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('SUPPLIER'):
          moduleName = constant.AUTOCOMPLETE_KEY_SUPPLIER
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('TRANSPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_TRANSPORT
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMS'):
          moduleName = constant.AUTOCOMPLETE_KEY_CUSTOMS
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS'):
          moduleName = constant.AUTOCOMPLETE_KEY_FUNDERS
          break
      }
      return moduleName
    },
    orderModuleName() {
      let moduleName = enums.ORDER_TYPE.getFieldByKey('IMPORT')
      switch (this.form.orderType) {
        case enums.ORDER_TYPE.getFieldByKey('IMPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_IMPORT_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('EXPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_EXPORT_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_PURCHASE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_SALE'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_SALE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('PURCHASE'):
          moduleName = constant.AUTOCOMPLETE_KEY_PURCHASE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('STORAGE'):
          moduleName = constant.AUTOCOMPLETE_KEY_STORAGE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_FREIGHT_ORDER
          break
      }
      return moduleName
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        if (this.businessType) {
          form.relationBillType = this.businessType
        }
        this.form = clone(form, true)
        const { DICTS_RELATION_BILL_TYPE, DICTS_PAY_COMPANY_TYPE, DICTS_ORDER_TYPE, DICTS_COST_TYPE, DICTS_TAX_RATE, DICTS_VERIFY_STATUS } =
          constant
        Promise.all([
          getDataDictionary([
            DICTS_RELATION_BILL_TYPE,
            DICTS_PAY_COMPANY_TYPE,
            DICTS_ORDER_TYPE,
            DICTS_COST_TYPE,
            DICTS_TAX_RATE,
            DICTS_VERIFY_STATUS
          ]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctCostInvoiceById(this.tableRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts
          if (this.isJump) {
            Object.assign(this.form, {
              ...this.jumpRow,
              payCompanyId: this.jumpRow.customerCompanyId || 0,
              payCompanyName: this.jumpRow.customerName || ''
            })
          }
          this.orderTypes = this.dicts[DICTS_ORDER_TYPE].filter(v => v.value !== enums.ORDER_TYPE.getFieldByKey('PURCHASE'))
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              feeTax: String(info.data.feeTax)
            })
            this.$nextTick(() => {
              this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[1])
              this.getDetailsEditTableInstance().loadData(this.form.acctCostInvoiceDetailVOList || [])
            })
          } else {
            this.$nextTick(() => {
              this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[0])
            })
          }
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    /** 明细列数据 */
    handleColumns() {
      return [
        // 费用明细
        [
          {
            field: 'costName',
            title: '费用名称',
            width: 180,
            type: 'custom',
            rules: [{ required: true, message: '费用名称必填' }],
            customRender: (h, { row, column }) => {
              return (
                <business-autocomplete-basic
                  vModel={row[column.field]}
                  size="mini"
                  module-name={constant.AUTOCOMPLETE_KEY_COST_ITEM}
                  params={{
                    costType: this.form.costType
                  }}
                  label="费用名称"
                  placeholder="请输入费用名称"
                />
              )
            }
          },
          {
            field: 'costMoney',
            width: 180,
            title: '费用金额',
            type: 'inputNumber',
            rules: [{ required: true, message: '费用金额必填' }],
            sum: true,
            attrs: {
              precision: 2
            },
            on: {
              blur: (v, column, scope) => this.calcCostMoney(v, column, scope)
            }
          }
        ],
        [
          { field: 'costInvoiceNo', title: '应收编号', width: 150 },
          { field: 'productName', title: '品名', width: 120 },
          { field: 'productModel', title: '型号', width: 120 },
          { field: 'productBrand', title: '品牌', width: 120 },
          { field: 'productOrigin', title: '产地', width: 110 },
          { field: 'productUnit', title: '单位', width: 100 },
          {
            field: 'qty',
            title: '数量',
            width: 100,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            }
          },
          {
            field: 'settleMoney',
            width: 110,
            title: '应收金额',
            formatter: {
              type: 'number'
            }
          },
          { field: 'taxRate', width: 120, title: '税率' }
        ]
      ]
    },
    handlePayCompanyTypeChange() {
      Object.assign(this.form, {
        payCompanyName: '',
        payCompanyId: 0
      })
    },
    handleCostTypeChange(v) {
      if (this.value !== enums.COST_TYPE.getFieldByKey('VARIED')) {
        this.form.feeTax = ''
      }
      this.form.settleMoney = this.calcSettleMoney(v)
    },
    handleFeeTaxChange() {
      this.form.settleMoney = this.calcSettleMoney(this.form.costType)
    },
    handleCostMoneyBlur() {
      this.form.settleMoney = this.calcSettleMoney(this.form.costType)
    },
    handleSettleRateBlur() {
      this.form.settleMoney = this.calcSettleMoney(this.form.costType)
    },
    // 计算应收金额
    calcSettleMoney(costType) {
      let value = 0
      if (costType) {
        const { costMoney, settleRate, feeTax } = this.form
        // 杂费
        if (costType === enums.COST_TYPE.getFieldByKey('VARIED')) {
          const n1 = new BigNumber(costMoney).times(settleRate).toNumber()
          const n2 = new BigNumber(1).plus(feeTax ? Number(feeTax) : 0).toNumber()
          value = new BigNumber(n1).times(n2).dp(2).toNumber()
        } else {
          value = new BigNumber(costMoney).times(settleRate).dp(2).toNumber()
        }
      }
      return value
    },
    // 明细累加计算费用金额
    calcCostMoney() {
      const tableData = this.getDetailsEditTableInstance().getRecords()
      this.form.costMoney = tableData.reduce((total, row) => {
        return new BigNumber(total).plus(row.costMoney).dp(2).toNumber()
      }, 0)
      this.form.settleMoney = this.calcSettleMoney(this.form.costType)
    },
    beforeValueCostCurrencyChange() {
      const { costCurrency, settleCurrency } = this.form
      this.$nextTick(() => {
        if (this.form.costCurrency === '') {
          this.form.settleRate = 0
        } else {
          this.form.settleRate = costCurrency === settleCurrency ? 1 : 0
        }
        this.form.settleMoney = this.calcSettleMoney(this.form.costType)
      })
    },
    handleCostCurrencySelect(rows) {
      const { currencyName } = rows[0]
      this.form.settleCurrency = currencyName
      this.form.settleRate = currencyName === this.form.settleCurrency ? 1 : 0
      this.form.settleMoney = this.calcSettleMoney(this.form.costType)
    },
    beforeValueSettleCurrencyChange() {
      const { costCurrency, settleCurrency } = this.form
      this.$nextTick(() => {
        if (this.form.settleCurrenc === '') {
          this.form.settleRate = 0
        } else {
          this.form.settleRate = costCurrency === settleCurrency ? 1 : 0
        }
        this.form.settleMoney = this.calcSettleMoney(this.form.costType)
      })
    },
    handleSettleCurrencySelect(rows) {
      const { currencyName } = rows[0]
      this.form.settleRate = this.form.costCurrency === currencyName ? 1 : 0
      this.form.settleMoney = this.calcSettleMoney(this.form.costType)
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`应收类目明细: 第${rowIndex}行 ${rule.message}`)
            }
            const acctCostInvoiceDetailDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign(
              this.type === enums.FORM_TYPE.getFieldByKey('ADDED') ? { acctCostInvoiceDetailDTOList } : {},
              this.form
            )
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveAcctCostInvoice(formData)
                .then(() => {
                  this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}成功`)
                  this.visible = false
                  done()
                  this.reLoad(false)
                })
                .catch(() => {
                  done()
                })
            } else {
              updateAcctCostInvoice(formData)
                .then(() => {
                  this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}成功`)
                  this.visible = false
                  done()
                  // 刷新表格的时候，保存之前选中的数据
                  this.reLoad(true)
                })
                .catch(() => {
                  done()
                })
            }
          })
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
        }
      })
    },
    getFormInstance() {
      return this.$refs.formRef
    },
    getDetailsEditTableInstance() {
      return this.$refs.detailsEditTableRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="99%"
    custom-class="common-form-dialog acct-cost-invoice-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="付款方类型" prop="payCompanyType">
              <base-select
                v-model="form.payCompanyType"
                :disabled="disabledByCostType"
                placeholder="请选择付款方类型"
                :clearable="false"
                :options="dicts[constant.DICTS_PAY_COMPANY_TYPE]"
                @change="handlePayCompanyTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="付款方" prop="payCompanyName">
              <business-autocomplete-basic
                v-model="form.payCompanyName"
                label="付款方"
                placeholder="请输入付款方"
                :module-name="payCompanyModuleName"
                :auto-assign="{
                  payCompanyId: 'companyId'
                }"
                :form="form"
                @clear="() => (form.payCompanyId = 0)"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <!-- 财务管理的应收类目 -->
          <template v-if="!businessType">
            <base-col :span="6">
              <base-form-item label="订单类型" prop="orderType">
                <base-select
                  v-model="form.orderType"
                  :disabled="disabledByCostType"
                  placeholder="请选择订单类型"
                  :clearable="false"
                  :options="orderTypes"
                />
              </base-form-item>
            </base-col>
            <base-col :span="6">
              <base-form-item label="订单编号" prop="orderNo">
                <business-autocomplete-basic
                  v-model="form.orderNo"
                  label="订单编号"
                  placeholder="请输入订单编号"
                  :disabled="disabledByCostType"
                  :params="{
                    auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS')
                  }"
                  :module-name="orderModuleName"
                  :auto-assign="{
                    orderId: 'id'
                  }"
                  :form="form"
                  @clear="() => (form.orderId = 0)"
                ></business-autocomplete-basic>
              </base-form-item>
            </base-col>
          </template>

          <base-col :span="6">
            <base-form-item label="收款主体" prop="principalName">
              <business-autocomplete-basic
                v-model="form.principalName"
                label="收款主体"
                placeholder="请输入收款主体"
                :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                :auto-assign="{
                  principalId: 'id'
                }"
                :form="form"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="费用大类" prop="costType">
              <base-select
                v-model="form.costType"
                placeholder="请选择费用大类"
                disabled
                :options="dicts[constant.DICTS_COST_TYPE]"
                @change="handleCostTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              label="费用名称"
              prop="costName"
              :rules="type === enums.FORM_TYPE.getFieldByKey('ADDED') ? [] : [{ required: true, message: '费用名称必填' }]"
            >
              <business-autocomplete-basic
                v-model="form.costName"
                label="费用名称"
                placeholder="请输入费用名称"
                :disabled="type === enums.FORM_TYPE.getFieldByKey('ADDED') || disabledByCostType"
                :params="{
                  costType: form.costType
                }"
                :module-name="constant.AUTOCOMPLETE_KEY_COST_ITEM"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="费用发生日期" prop="costDate">
              <base-date-picker v-model="form.costDate" type="date" placeholder="选择费用发生日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="应收日期" prop="settleDate">
              <base-date-picker v-model="form.settleDate" type="date" placeholder="选择应收日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="费用币别" prop="costCurrency">
              <business-autocomplete-basic
                v-model="form.costCurrency"
                label="费用币别"
                placeholder="请输入费用币别"
                :before-input="beforeValueCostCurrencyChange"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                @select="handleCostCurrencySelect"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="费用金额" prop="costMoney">
              <base-input-number
                v-model="form.costMoney"
                :disabled="type === enums.FORM_TYPE.getFieldByKey('ADDED') || disabledByCostType"
                placeholder="请输入费用金额"
                @blur="handleCostMoneyBlur"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="费用税点" prop="feeTax">
              <base-select
                v-model="form.feeTax"
                placeholder="请选择费用税点"
                :options="dicts[constant.DICTS_TAX_RATE]"
                @change="handleFeeTaxChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="结算汇率" prop="settleRate">
              <base-input-number
                v-model="form.settleRate"
                :disabled="disabledByCostType"
                :precision="6"
                placeholder="请输入结算汇率"
                @blur="handleSettleRateBlur"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="应收币别" prop="settleCurrency">
              <business-autocomplete-basic
                v-model="form.settleCurrency"
                label="应收币别"
                placeholder="请输入应收币别"
                :before-input="beforeValueSettleCurrencyChange"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                @select="handleSettleCurrencySelect"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <!-- 费用大类除了杂费计算公式: 费用金额*汇率  费用大类为杂费计算公式: 费用金额*汇率*(1+费用税点) -->
          <base-col :span="6">
            <base-form-item label="应收金额" prop="settleMoney">
              <base-input-number v-model="form.settleMoney" disabled />
            </base-form-item>
          </base-col>

          <!-- 报关管理、仓储物流 模块显示 -->
          <template v-if="businessType">
            <base-col :span="6">
              <base-form-item label="关联单据类型" prop="relationBillType">
                <base-select
                  v-model="businessType"
                  disabled
                  placeholder="请选择关联单据类型"
                  :clearable="false"
                  :options="dicts[constant.DICTS_RELATION_BILL_TYPE]"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="关联单据号" prop="relationBillNo">
                <business-autocomplete-basic
                  v-model="form.relationBillNo"
                  label="关联单据号"
                  placeholder="请输入关联单据号"
                  :disabled="type !== enums.FORM_TYPE.getFieldByKey('ADDED')"
                  :params="{
                    auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS')
                  }"
                  :module-name="
                    businessType === enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATION')
                      ? constant.AUTOCOMPLETE_KEY_CUSTOMS_ORDER_DECLAR
                      : constant.AUTOCOMPLETE_KEY_CUSTOMS_ORDER_TRANSPORT_DECLAR
                  "
                  :auto-assign="{
                    relationBillId: 'id'
                  }"
                  :form="form"
                ></business-autocomplete-basic>
              </base-form-item>
            </base-col>
          </template>
          <!-- 财务管理 模块显示 -->
          <template v-if="type !== enums.FORM_TYPE.getFieldByKey('ADDED') && !businessType">
            <base-col :span="6">
              <base-form-item label="关联单据号" prop="relationBillNo">
                <base-input v-model="form.relationBillNo" disabled />
              </base-form-item>
            </base-col>
          </template>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" :disabled="disabledByCostType" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 应收类目明细 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          应收类目明细
        </span>
        <base-edit-table
          ref="detailsEditTableRef"
          height="300px"
          :name="constant.TABLE_NAME_ACCT_COST_INVO_ENTER"
          @delete="calcCostMoney"
        />
      </div>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.acct-cost-invoice-dialog {
  .common-form-block {
    &.is-special {
      box-sizing: border-box;
      padding-bottom: 10px;
      .common-form-block-header {
        margin-bottom: 10px;
      }
    }
  }
}
</style>

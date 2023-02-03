<script>
import { getOrderImportById } from '@/api/order/order-import'
import { getOrderExportById } from '@/api/order/order-export'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { getAcctCostPayById, saveAcctCostPay, updateAcctCostPay } from '@/api/finance/acct-cost-pay'
import BigNumber from '@/utils/big-number'
import dayjs from '@/utils/day'

const form = {
  receiptCompanyType: enums.PAY_COMPANY_TYPE.getFieldByKey('SUPPLIER'),
  receiptCompanyId: 0,
  receiptCompanyName: '',
  principalName: '',
  principalId: '',
  relationBillType: '',
  relationBillNo: '',
  costName: '',
  costType: '',
  orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT'),
  costDate: dayjs().format('YYYY-MM-DD'),
  orderNo: '',
  orderId: 0,
  costCurrency: '',
  costMoney: 0,
  settleCurrency: '',
  settleMoney: 0,
  settleDate: '',
  settleRate: 1
}

export default {
  name: 'EnterFormPay',

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
    mainRow: Object,
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    options: {
      type: Array,
      default: () => []
    },
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
        receiptCompanyName: [{ required: true, message: '收款方必填' }],
        principalName: [{ required: true, message: '付款主体必填' }],
        costCurrency: [{ required: true, message: '费用币别必填' }],
        settleCurrency: [{ required: true, message: '应付币别必填' }],
        costDate: [{ required: true, message: '费用发生日期必填' }],
        costName: [{ required: true, message: '费用名称必填' }],
        costType: [{ required: true, message: '费用大类必填' }],
        relationBillNo: [{ required: !!this.businessType, message: '关联单据号必填' }]
      },
      dicts: {}
    }
  },
  computed: {
    receiptCompanyModuleName() {
      let moduleName = ''
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
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        const { orderType, orderNo, supplierName, supplierCompanyId, currencyName } = this.tableRow

        this.form = Object.assign(clone(form, true), {
          orderType,
          orderNo,
          receiptCompanyName: supplierName,
          receiptCompanyId: supplierCompanyId,
          settleCurrency: currencyName,
          costCurrency: currencyName
        })
        if (this.businessType) {
          this.form.relationBillType = this.businessType
          this.form.costType =
            this.businessType === enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATIONTRANSPORTATION')
              ? enums.COST_TYPE.getFieldByKey('VARIED')
              : ''
        }
        const { DICTS_RELATION_BILL_TYPE, DICTS_PAY_COMPANY_TYPE, DICTS_COST_TYPE, DICTS_ORDER_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_RELATION_BILL_TYPE, DICTS_PAY_COMPANY_TYPE, DICTS_COST_TYPE, DICTS_ORDER_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctCostPayById(this.mainRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
          }
          this.form.orderId = this.tableRow.id
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    },
    'form.costName'() {
      this.form.costMoney = 0
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleCostTypeChange(value) {
      // 以下的逻辑只在进口订单、出口订单、代采订单、代销订单、采购订单有效
      const orderTypes = [
        enums.ORDER_TYPE.getFieldByKey('IMPORT'),
        enums.ORDER_TYPE.getFieldByKey('EXPORT'),
        enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'),
        enums.ORDER_TYPE.getFieldByKey('AGENT_SALE'),
        enums.ORDER_TYPE.getFieldByKey('PURCHASE')
      ]
      // 费用大类为货款时，费用名称默认为货款
      if (value === enums.COST_TYPE.getFieldByKey('CARGO') && orderTypes.includes(this.tableRow.orderType)) {
        this.form.costName = '货款'
        const getCurrencyByOrderTypes = [
          enums.ORDER_TYPE.getFieldByKey('IMPORT'),
          enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'),
          enums.ORDER_TYPE.getFieldByKey('AGENT_SALE'),
          enums.ORDER_TYPE.getFieldByKey('PURCHASE')
        ]

        // 除了出口订单币别默认直接为人民币, 其他订单取的是订单币别
        if (getCurrencyByOrderTypes.includes(this.tableRow.orderType)) {
          this.form.settleCurrency = this.mainRow.currencyName
          this.form.costCurrency = this.mainRow.currencyName
        } else if (this.tabsParams.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
          this.form.settleCurrency = '人民币'
          this.form.costCurrency = '人民币'
        }

        // 费用金额 = 订单金额 - 已申请付汇(结汇)金额
        this.form.costMoney = new BigNumber(this.mainRow.totalMoney).minus(this.mainRow.payApplyMoney).toNumber()
        // 重新计算一下应付金额
        this.calcSettleMoney()
      }
    },
    beforeValueCostCurrencyChange() {
      const { costCurrency, settleCurrency } = this.form

      this.$nextTick(() => {
        if (this.form.costCurrency === '') {
          this.form.settleRate = 0
        } else {
          this.form.settleRate = costCurrency === settleCurrency ? 1 : 0
        }
        this.calcSettleMoney()
      })
    },
    handleCostCurrencySelect(rows) {
      const { currencyName } = rows[0]
      this.form.settleCurrency = currencyName
      this.form.settleRate = currencyName === this.form.settleCurrency ? 1 : 0
      this.calcSettleMoney()
    },
    handleSettleCurrencySelect(rows) {
      const { currencyName } = rows[0]
      this.form.settleRate = this.form.costCurrency === currencyName ? 1 : 0
      this.calcSettleMoney()
    },
    beforeValueSettleCurrencyChange() {
      const { costCurrency, settleCurrency } = this.form

      this.$nextTick(() => {
        if (this.form.settleCurrency === '') {
          this.form.settleRate = 0
        } else {
          this.form.settleRate = costCurrency === settleCurrency ? 1 : 0
        }
        this.calcSettleMoney()
      })
    },
    // 计算应收金额
    calcSettleMoney() {
      const { costMoney, settleRate } = this.form
      this.form.settleMoney = new BigNumber(costMoney || 0).times(settleRate).dp(2).toNumber()
    },
    handleCostNameSelect(rows) {
      const { costName } = rows[0]
      // 选择货款的情况，带出订单报关金额放到费用金额上面
      if (costName === '货款') {
        if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
          getOrderImportById(this.tableRow.id).then(res => {
            this.form.costMoney = res.data.totalMoney
          })
        } else if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
          getOrderExportById(this.tableRow.id).then(res => {
            this.form.costMoney = res.data.totalMoney
          })
        }
      }
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveAcctCostPay(this.form)
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
            updateAcctCostPay(this.form)
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
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
        }
      })
    },
    getFormInstance() {
      return this.$refs.formRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="800px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row :gutter="10">
        <base-col :span="12">
          <base-form-item label="收款方类型" prop="receiptCompanyType">
            <base-select
              v-model="form.receiptCompanyType"
              placeholder="请选择收款方类型"
              :clearable="false"
              :options="dicts[constant.DICTS_PAY_COMPANY_TYPE]"
            />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="收款方" prop="receiptCompanyName">
            <business-autocomplete-basic
              v-model="form.receiptCompanyName"
              label="收款方"
              placeholder="请输入收款方"
              :module-name="receiptCompanyModuleName"
              :auto-assign="{
                receiptCompanyId: 'companyId'
              }"
              :form="form"
              @clear="() => (form.receiptCompanyId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="付款主体" prop="principalName">
            <business-autocomplete-basic
              v-model="form.principalName"
              label="付款主体"
              placeholder="请输入付款主体"
              :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
              :auto-assign="{
                principalId: 'id'
              }"
              :form="form"
              @clear="() => (form.principalId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <!-- 报关管理、仓储物流 模块显示 -->
        <template v-if="businessType">
          <base-col :span="12">
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
          <base-col :span="12">
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
        <!-- 其他tab页显示 -->
        <template v-else>
          <base-col :span="12">
            <base-form-item label="订单类型" prop="orderType">
              <base-select v-model="form.orderType" placeholder="请选择订单类型" disabled :options="dicts[constant.DICTS_ORDER_TYPE]" />
            </base-form-item>
          </base-col>

          <base-col :span="12">
            <base-form-item label="订单编号" prop="orderNo">
              <base-input v-model="form.orderNo" disabled />
            </base-form-item>
          </base-col>
        </template>

        <base-col :span="12">
          <base-form-item label="费用大类" prop="costType">
            <base-select
              v-model="form.costType"
              placeholder="请选择费用大类"
              :disabled="form.relationBillType === enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATIONTRANSPORTATION')"
              :options="dicts[constant.DICTS_COST_TYPE]"
              @change="handleCostTypeChange"
            />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="费用名称" prop="costName">
            <business-autocomplete-basic
              v-model="form.costName"
              label="费用名称"
              placeholder="请输入费用名称"
              :params="{
                costType: form.costType
              }"
              :module-name="constant.AUTOCOMPLETE_KEY_COST_ITEM"
              @select="handleCostNameSelect"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
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

        <base-col :span="12">
          <base-form-item label="费用金额" prop="costMoney">
            <base-input-number v-model="form.costMoney" placeholder="请输入费用金额" @blur="calcSettleMoney" @clear="calcSettleMoney" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="应付币别" prop="settleCurrency">
            <business-autocomplete-basic
              v-model="form.settleCurrency"
              label="应付币别"
              placeholder="请输入应付币别"
              :before-input="beforeValueSettleCurrencyChange"
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              @select="handleSettleCurrencySelect"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="结算汇率" prop="settleRate">
            <base-input-number
              v-model="form.settleRate"
              :precision="6"
              placeholder="请输入结算汇率"
              @blur="calcSettleMoney"
              @clear="calcSettleMoney"
            />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="应付金额" prop="settleMoney">
            <base-input-number v-model="form.settleMoney" disabled placeholder="请输入应付金额" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

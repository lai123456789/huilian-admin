<script>
import { getAcctReceiptById, saveAcctReceipt, updateAcctReceipt } from '@/api/finance/acct-receipt'
import { getBaseForeignRate } from '@/api/base/base-foreign-rate'
import { getCompanyBank } from '@/api/company/company-bank'
import { getCompanyPrincipal } from '@/api/company/company-principal'
import { getDataDictionary } from '@/api/admin/dicts'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import dayjs from '@/utils/day'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  payCompanyType: enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMER'),
  payCompanyName: '',
  payCompanyId: 0,
  chargeBearType: '',
  receiptUse: '',
  principalName: '',
  principalId: 0,
  principalCompanyId: 0,
  receiptAccount: '',
  receiptBankName: '',
  customerId: 0,
  customerName: '',
  receiptMode: '',
  serialNumber: '',
  receiptRate: 1, // 收款币别为人民币，汇率为1，收款币别为外币，手输
  receiptDate: dayjs().format('YYYY-MM-DD'),
  receiptCurrency: '人民币',
  receiptMoney: 0,
  verifyMoney: 0,
  verifyPayMoney: 0,
  receiptCharge: 0,
  lockMoney: 0,
  remark: ''
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
    }
  },
  data() {
    this.defaultConfig = {}
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        payCompanyName: [{ required: true, message: '付款方必填' }],
        principalName: [{ required: true, message: '收款主体必填' }],
        receiptBankName: [{ required: true, message: '收款银行名称必填' }],
        receiptAccount: [{ required: true, message: '收款银行账号必填' }],
        receiptCurrency: [{ required: true, message: '收款币别必填' }],
        receiptDate: [{ required: true, message: '收款日期必填' }],
        receiptMode: [{ required: true, message: '收款方式必填' }],
        receiptMoney: [{ required: true, message: '收款金额必填', validator: validatorNumRequired }],
        chargeBearType: [{ required: true, message: '手续费承担方式必填' }]
      },
      dicts: {}
    }
  },
  computed: {
    payCompanyModuleName() {
      let moduleName = ''
      switch (this.form.payCompanyType) {
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
        this.form = clone(form, true)
        const { DICTS_PAY_COMPANY_TYPE, DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE, DICTS_RECEIPT_USE } = constant
        Promise.all([
          getDataDictionary([DICTS_PAY_COMPANY_TYPE, DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE, DICTS_RECEIPT_USE]),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_FINANCE_SETTLEMENT_CONFIG),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctReceiptById(this.tableRow.id)
        ]).then(([dicts, defaultConfigRes, info]) => {
          this.dicts = dicts

          this.defaultConfig = defaultConfigRes.data ? defaultConfigRes.data : false

          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
          }
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    },
    // ----------- 固定定义 -----------
    'form.receiptCurrency'() {
      this.getReceiptRate()
    }
  },
  methods: {
    handlePayCompanyTypeChange() {
      Object.assign(this.form, {
        payCompanyName: '',
        payCompanyId: 0
      })
    },
    handlePrincipalNameSelect(rows) {
      const { id, companyName, companyId } = rows[0]

      Object.assign(this.form, {
        principalCompanyId: companyId,
        receiptBankName: '',
        receiptAccount: '',
        principalName: companyName,
        principalId: id
      })

      getCompanyBank({ companyId }).then(res => {
        const records = res.data.records
        if (records.length > 0) {
          const { bankName, accountCode } = records[0]
          Object.assign(this.form, {
            receiptBankName: bankName,
            receiptAccount: accountCode
          })
        }
      })
    },
    handlePrincipalNameClear() {
      Object.assign(this.form, {
        principalId: 0,
        principalCompanyId: 0
      })
    },
    async handleReceiptBankNameAddBeforeClick() {
      if (this.form.principalId !== 0 && this.form.principalCompanyId === 0) {
        const res = await getCompanyPrincipal({ id: this.form.principalId })
        const data = res.data
        if (data) {
          const { companyId } = data
          this.form.principalCompanyId = companyId
        }
      }
      if (this.form.principalId === 0) {
        this.$message.warning('请先选择已存在的收款主体')
        return false
      }
      return true
    },
    handleReceiptBankNameSelect(rows) {
      const { bankName, accountCode } = rows[0]
      Object.assign(this.form, {
        receiptBankName: bankName,
        receiptAccount: accountCode
      })
    },
    handleReceiptCurrencySelect(rows) {
      const { currencyName } = rows[0]
      if (currencyName === '人民币') {
        this.form.receiptRate = 1
      } else {
        this.form.receiptRate = 0
      }
    },
    handleReceiptDateChange() {
      this.getReceiptRate()
    },
    handleReceiptUseChange() {
      this.getReceiptRate()
    },
    // 根据参数管理获取到汇率取值时间和汇率取值价格
    getReceiptRate() {
      return new Promise((resolve, reject) => {
        if (
          [enums.RECEIPT_USE.getFieldByKey('PAYMENT'), enums.RECEIPT_USE.getFieldByKey('SOE')].includes(this.form.receiptUse) &&
          this.form.receiptCurrency &&
          this.form.receiptCurrency !== '人民币' &&
          this.defaultConfig
        ) {
          const { paymentRateDate, paymentRateType, settlementRateDate, settlementRateType } = this.defaultConfig

          getBaseForeignRate({
            currency: this.form.receiptCurrency,
            releaseDate: this.form.receiptDate
              ? `${this.form.receiptDate},${this.form.receiptDate}`
              : `${dayjs().format('YYYY-MM-DD')},${dayjs().format('YYYY-MM-DD')}`,
            releaseTime: this.form.receiptUse === enums.RECEIPT_USE.getFieldByKey('PAYMENT') ? paymentRateDate : settlementRateDate
          })
            .then(res => {
              const records = res.data.records
              this.form.receiptRate =
                records.length > 0
                  ? records[0][
                      this.setForeignPriceType(
                        this.form.receiptUse === enums.RECEIPT_USE.getFieldByKey('PAYMENT') ? paymentRateType : settlementRateType
                      )
                    ]
                  : 0
              resolve()
            })
            .catch(() => {
              reject()
            })
        } else {
          resolve()
        }
      })
    },
    setForeignPriceType(foreignPriceType) {
      let field = ''
      switch (foreignPriceType) {
        case enums.FOREIGN_PRICE_TYPE.getFieldByKey('PER'):
          field = 'buyingRate'
          break
        case enums.FOREIGN_PRICE_TYPE.getFieldByKey('EXCHOFFER'):
          field = 'buyingPrice'
          break
        case enums.FOREIGN_PRICE_TYPE.getFieldByKey('EXCHBID'):
          field = 'sellingRate'
          break
        case enums.FOREIGN_PRICE_TYPE.getFieldByKey('CASHBID'):
          field = 'sellingPrice'
          break
      }

      return field
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveAcctReceipt(this.form)
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
            updateAcctReceipt(this.form)
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
    width="99%"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="112px" size="mini">
      <base-row :gutter="10">
        <base-col :span="6">
          <base-form-item label="付款方类型" prop="payCompanyType">
            <base-select
              v-model="form.payCompanyType"
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

        <base-col :span="6">
          <base-form-item label="委托客户" prop="customerName">
            <business-autocomplete-basic
              v-model="form.customerName"
              label="委托客户"
              placeholder="请输入委托客户"
              :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
              :auto-assign="{
                customerId: 'id'
              }"
              :form="form"
              @clear="() => (form.customerId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="款项用途" prop="receiptUse">
            <base-select
              v-model="form.receiptUse"
              placeholder="请选择款项用途"
              :clearable="false"
              :options="dicts[constant.DICTS_RECEIPT_USE]"
              @change="handleReceiptUseChange"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="收款方式" prop="receiptMode">
            <base-select
              v-model="form.receiptMode"
              placeholder="请选择收款方式"
              :clearable="false"
              :options="dicts[constant.DICTS_RECEIPT_MODE]"
            />
          </base-form-item>
        </base-col>

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
              @select="handlePrincipalNameSelect"
              @clear="handlePrincipalNameClear"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="收款银行名称" prop="receiptBankName">
            <business-autocomplete-bank
              v-model="form.receiptBankName"
              value-key="bankName"
              label="收款银行名称"
              placeholder="请输入收款银行名称"
              :params="{
                companyId: form.principalCompanyId
              }"
              :add-before-click="handleReceiptBankNameAddBeforeClick"
              @select="handleReceiptBankNameSelect"
            ></business-autocomplete-bank>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="收款银行账号" prop="receiptAccount">
            <base-input v-model="form.receiptAccount" placeholder="请输入收款银行账号"></base-input>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="银行流水号" prop="serialNumber">
            <base-input v-model="form.serialNumber" placeholder="请输入银行流水号"></base-input>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="收款日期" prop="receiptDate">
            <base-date-picker v-model="form.receiptDate" type="date" placeholder="选择收款日期" @change="handleReceiptDateChange" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="收款币别" prop="receiptCurrency">
            <business-autocomplete-basic
              v-model="form.receiptCurrency"
              label="收款币别"
              placeholder="请输入收款币别"
              :before-input="
                () => {
                  form.receiptRate = 0
                }
              "
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              @select="handleReceiptCurrencySelect"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="收款金额" prop="receiptMoney">
            <base-input-number v-model="form.receiptMoney" placeholder="请输入收款金额" />
          </base-form-item>
        </base-col>

        <base-col v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')" :span="6">
          <base-form-item label="锁定金额" prop="lockMoney">
            <base-input-number v-model="form.lockMoney" readonly placeholder="请输入锁定金额" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="手续费" prop="receiptCharge">
            <base-input-number v-model="form.receiptCharge" placeholder="请输入手续费" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="手续费承担方式" prop="chargeBearType">
            <base-select
              v-model="form.chargeBearType"
              placeholder="请选择手续费承担方式"
              :options="dicts[constant.DICTS_CHARGE_BEAR_TYPE]"
            />
          </base-form-item>
        </base-col>

        <base-col v-if="form.receiptCurrency && form.receiptCurrency !== '人民币'" :span="6">
          <base-form-item label="收款汇率" prop="receiptRate">
            <base-input-number v-model="form.receiptRate" :precision="6" placeholder="请输入收款汇率" />
          </base-form-item>
        </base-col>

        <base-col v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')" :span="6">
          <base-form-item label="核销金额" prop="verifyMoney">
            <base-input v-model="form.verifyMoney" readonly />
          </base-form-item>
        </base-col>

        <base-col v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')" :span="6">
          <base-form-item label="已付汇金额/已结汇金额" prop="verifyPayMoney">
            <base-input v-model="form.verifyPayMoney" readonly />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

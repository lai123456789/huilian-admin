<script>
import { getAcctBankAcceptanceById, saveAcctBankAcceptance, updateAcctBankAcceptance } from '@/api/finance/acct-bank-acceptance'
import { getCompanyBank } from '@/api/company/company-bank'
import { getCompanyPrincipal } from '@/api/company/company-principal'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  drawerName: '',
  drawerBankName: '',
  drawerAccount: '',
  acceptanceCompanyType: '',
  acceptanceCompanyName: '',
  acceptanceCompanyId: 0,
  acceptanceAccount: '',
  payeeName: '',
  payeePrincipalCompanyId: 0,
  payeeBankName: '',
  payeeAccount: '',
  payeePrincipalId: 0,
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
    rows: Array,
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
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        billType: [{ required: true, message: '票据类型必填' }],
        receiptDate: [{ required: true, message: '收票日期必填' }],
        releaseDate: [{ required: true, message: '出票日期必填' }],
        acceptanceCurrency: [{ required: true, message: '币别必填' }],
        acceptanceMoney: [{ required: true, message: '票面金额必填', validator: validatorNumRequired, trigger: 'blur' }],
        drawerName: [{ required: true, message: '出票人全称必填' }],
        drawerBankName: [{ required: true, message: '出票人开户银行必填' }],
        drawerAccount: [{ required: true, message: '出票人账号必填' }],
        acceptanceCompanyType: [{ required: true, message: '交票人类型必填' }],
        acceptanceCompanyName: [{ required: true, message: '交票人必填' }],
        payeeName: [{ required: true, message: '收款人主体必填' }],
        payeeAccount: [{ required: true, message: '收款人账号必填' }]
      },
      dicts: {},
      payCompanyTypes: []
    }
  },
  computed: {
    acceptanceCompanyModuleName() {
      let moduleName = ''
      switch (this.form.acceptanceCompanyType) {
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
      }
      return moduleName
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.$nextTick(() => {
          this.form = clone(form, true)
          this.getFormInstance().clearValidate()
          this.getDetailsEditTableInstance().loadColumns(this.handleColumns())

          const { DICTS_BILL_TYPE, DICTS_ACCEPTANCE_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_DISCOUNT_BEAR_TYPE } = constant
          Promise.all([
            getDataDictionary([DICTS_BILL_TYPE, DICTS_ACCEPTANCE_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_DISCOUNT_BEAR_TYPE]),
            this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctBankAcceptanceById(this.tableRow.id)
          ]).then(async ([dicts, info]) => {
            this.dicts = dicts
            this.payCompanyTypes = this.dicts[DICTS_PAY_COMPANY_TYPE].filter(
              v => ![enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS')].includes(v.value)
            )
            if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
              Object.assign(this.form, info.data)
              this.getDetailsEditTableInstance().loadData(this.form.acctBankAcceptanceEndosementVOList || [], 'cover')
            }
          })
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
        { field: 'endorserName', title: '背书人全称', type: 'input', width: 160 },
        { field: 'endorsementDate', title: '背书日期', type: 'date', width: 160 },
        { field: 'endorseeName', title: '被背书人全称', type: 'input', width: 180 }
      ]
    },
    handlePayeeNameSelect(rows) {
      const { id, companyId } = rows[0]

      Object.assign(this.form, {
        payeePrincipalCompanyId: companyId,
        payeeBankName: '',
        payeeAccount: '',
        payeePrincipalId: id
      })

      getCompanyBank({ companyId }).then(res => {
        const records = res.data.records
        if (records.length > 0) {
          const { bankName, accountCode } = records[0]
          Object.assign(this.form, {
            payeeBankName: bankName,
            payeeAccount: accountCode
          })
        }
      })
    },
    handlePayeeNameClear() {
      Object.assign(this.form, {
        payeePrincipalId: 0,
        payeePrincipalCompanyId: 0
      })
    },
    async handlePayeeBankNameAddBeforeClick() {
      if (this.form.payeePrincipalId !== 0 && this.form.payeePrincipalCompanyId === 0) {
        const res = await getCompanyPrincipal({ id: this.form.payeePrincipalId })
        const data = res.data
        if (data) {
          const { companyId } = data
          this.form.payeePrincipalCompanyId = companyId
        }
      }
      if (this.form.payeePrincipalId === 0) {
        this.$message.warning('请先选择已存在的收款主体')
        return false
      }
      return true
    },
    handlePayeeBankNameSelect(rows) {
      const { bankName, accountCode } = rows[0]
      Object.assign(this.form, {
        payeeBankName: bankName,
        payeeAccount: accountCode
      })
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`背书信息: 第${rowIndex}行 ${rule.message}`)
            }
            const records = this.getDetailsEditTableInstance().getRecords()
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              const formData = Object.assign(
                {
                  acctBankAcceptanceEndosementDTOList: records
                },
                this.form
              )
              saveAcctBankAcceptance(formData)
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
              const formData = Object.assign(
                {
                  acctBankAcceptanceEndosementDTOList: records.map(v => ({
                    acceptanceId: v.acceptanceId,
                    acceptanceNo: v.acceptanceNo,
                    endorseeName: v.endorseeName,
                    endorsementDate: v.endorsementDate,
                    endorserName: v.endorserName
                  }))
                },
                this.form
              )
              updateAcctBankAcceptance(formData)
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
    custom-class="common-form-dialog acct-bank-acceptance-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="115px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="票据类型" prop="billType">
              <base-select v-model="form.billType" placeholder="请选择票据类型" :options="dicts[constant.DICTS_BILL_TYPE]" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="票据号码" prop="billNo">
              <base-input v-model="form.billNo" placeholder="请选择票据号码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="票据到期日" prop="expiryDate">
              <base-date-picker v-model="form.expiryDate" type="date" placeholder="选择票据到期日" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收票日期" prop="receiptDate">
              <base-date-picker v-model="form.receiptDate" type="date" placeholder="选择收票日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="出票日期" prop="releaseDate">
              <base-date-picker v-model="form.releaseDate" type="date" placeholder="选择出票日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="币别" prop="acceptanceCurrency">
              <business-autocomplete-basic
                v-model="form.acceptanceCurrency"
                label="币别"
                placeholder="请输入币别"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="票面金额" prop="acceptanceMoney">
              <base-input-number v-model="form.acceptanceMoney" placeholder="请输入票面金额" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="承兑协议编号" prop="agreementNo">
              <base-input v-model="form.agreementNo" placeholder="请输入承兑协议编号" />
            </base-form-item>
          </base-col>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="12">
            <base-form-item label="摘要" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入摘要" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 票面信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          票面信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="出票人全称" prop="drawerName">
              <base-input v-model="form.drawerName" placeholder="请输入出票人全称" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="出票人开户银行" prop="drawerBankName">
              <base-input v-model="form.drawerBankName" placeholder="请输入出票人开户银行" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="出票人账号" prop="drawerAccount">
              <base-input v-model="form.drawerAccount" placeholder="请输入出票人账号" />
            </base-form-item>
          </base-col>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="交票人类型" prop="acceptanceCompanyType">
              <base-select v-model="form.acceptanceCompanyType" placeholder="请选择交票人类型" :options="payCompanyTypes" />
            </base-form-item>
          </base-col>

          <base-col v-if="form.acceptanceCompanyType" :span="6">
            <base-form-item label="交票人" prop="acceptanceCompanyName">
              <business-autocomplete-basic
                v-model="form.acceptanceCompanyName"
                label="交票人"
                placeholder="请输入交票人"
                :module-name="acceptanceCompanyModuleName"
                :auto-assign="{
                  acceptanceCompanyId: 'companyId'
                }"
                :form="form"
                @clear="() => (form.acceptanceCompanyId = 0)"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="交票人银行账号" prop="acceptanceAccount">
              <base-input v-model="form.acceptanceAccount" placeholder="请输入交票人银行账号" />
            </base-form-item>
          </base-col>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="收款人主体" prop="payeeName">
              <business-autocomplete-basic
                v-model="form.payeeName"
                label="收款人主体"
                placeholder="请输入收款人主体"
                :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                @select="handlePayeeNameSelect"
                @clear="handlePayeeNameClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收款人开户银行" prop="payeeBankName">
              <business-autocomplete-bank
                v-model="form.payeeBankName"
                value-key="bankName"
                label="收款人开户银行"
                placeholder="请输入收款人开户银行"
                :params="{
                  companyId: form.payeePrincipalCompanyId
                }"
                :add-before-click="handlePayeeBankNameAddBeforeClick"
                @select="handlePayeeBankNameSelect"
              ></business-autocomplete-bank>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收款人账号" prop="payeeAccount">
              <base-input v-model="form.payeeAccount" placeholder="请输入收款人账号"></base-input>
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 背书信息 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          背书信息
        </span>
        <base-edit-table ref="detailsEditTableRef" height="300px" :name="constant.TABLE_NAME_ACCT_BANK_ACCEPTANCE_ENTER" />
      </div>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.acct-bank-acceptance-dialog {
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

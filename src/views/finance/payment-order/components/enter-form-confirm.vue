<script>
import { getAcctPaymentById, confimAcctPayment } from '@/api/finance/acct-payment'
import { getCompanyBank } from '@/api/company/company-bank'
import { getCompanyPrincipal } from '@/api/company/company-principal'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  fundersPayFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
  payBankName: '',
  payAccount: '',
  payCharge: '',
  payDate: '',
  principalId: 0,
  principalCompanyId: 0,
  principalName: '',
  payCurrency: '',
  payMoney: '',
  payRate: 1,
  remark: '',
  serialNumber: ''
}

export default {
  name: 'EnterFormConfirm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
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
        payBankName: [{ required: true, message: '付款银行名称必填' }],
        payAccount: [{ required: true, message: '付款银行账号必填', trigger: 'blur' }],
        payDate: [{ required: true, message: '实际付款日期必填', trigger: 'blur' }],
        serialNumber: [{ required: true, message: '银行流水号必填', trigger: 'blur' }]
      },
      dicts: {}
    }
  },
  computed: {
    principalNameLabel() {
      return this.form.fundersPayFlag === enums.WHETHER_STATUS.getFieldByKey('NO') ? '付款主体' : '付款方'
    },
    principalNameModuleName() {
      return this.form.fundersPayFlag === enums.WHETHER_STATUS.getFieldByKey('NO')
        ? constant.AUTOCOMPLETE_KEY_PRINCIPAL
        : constant.AUTOCOMPLETE_KEY_FUNDERS
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_WHETHER_STATUS } = constant
        Promise.all([getDataDictionary([DICTS_WHETHER_STATUS]), getAcctPaymentById(this.tableRow.id)]).then(([dicts, info]) => {
          this.dicts = dicts
          Object.assign(this.form, info.data, {
            payRate: info.data.payCurrency === '人民币' ? 1 : info.data.payRate
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
    async handlePrincipalNameSelect(rows) {
      const { id, companyName, companyId } = rows[0]
      Object.assign(this.form, {
        principalCompanyId: companyId,
        companyId,
        principalName: companyName,
        principalId: id
      })
      const res = await getCompanyBank({ companyId })
      const records = res.data.records
      if (records.length > 0) {
        const { bankName, accountCode } = records[0]
        this.form.payBankName = bankName
        this.form.payAccount = accountCode
      } else {
        this.form.payBankName = ''
        this.form.payAccount = ''
      }
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
        this.$message.warning('请先选择已存在的付款主体')
        return false
      }
      return true
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          confimAcctPayment(this.form)
            .then(() => {
              this.$message.success('操作成功')
              done()
              this.visible = false
            })
            .catch(() => {
              done()
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
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="visible" width="800px" title="确认付款" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
      <base-row>
        <base-col :span="12">
          <base-form-item label="是否资金方代付" prop="fundersPayFlag">
            <base-select
              v-model="form.fundersPayFlag"
              disabled
              placeholder="请选择是否资金方代付"
              :clearable="false"
              :options="dicts[constant.DICTS_WHETHER_STATUS]"
            />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item
            :label="principalNameLabel"
            prop="principalName"
            :rules="[{ required: true, message: `${principalNameLabel}必填` }]"
          >
            <business-autocomplete-basic
              v-model="form.principalName"
              :disabled="form.fundersPayFlag === enums.WHETHER_STATUS.getFieldByKey('YES')"
              :module-name="principalNameModuleName"
              :placeholder="`请输入${principalNameLabel}`"
              :label="principalNameLabel"
              @select="handlePrincipalNameSelect"
              @clear="() => (principalId = 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="付款银行名称" prop="payBankName">
            <business-autocomplete-bank
              v-model="form.payBankName"
              value-key="bankName"
              label="付款银行名称"
              placeholder="请输入付款银行名称"
              :params="{
                companyId: form.principalCompanyId
              }"
              :auto-assign="{
                payBankName: 'bankName',
                payAccount: 'accountCode'
              }"
              :form="form"
              :add-before-click="handleReceiptBankNameAddBeforeClick"
            ></business-autocomplete-bank>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="付款银行账号" prop="payAccount">
            <base-input v-model="form.payAccount" placeholder="请输入付款银行账号" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="实际付款日期" prop="payDate">
            <base-date-picker v-model="form.payDate" placeholder="选择实际付款日期" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="付款汇率" prop="payRate">
            <base-input-number v-model="form.payRate" :precision="6" placeholder="请输入付款汇率" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="付款金额" prop="payMoney">
            <base-input-number v-model="form.payMoney" disabled />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="银行流水号" prop="serialNumber">
            <base-input v-model="form.serialNumber" placeholder="请输入银行流水号" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="手续费" prop="payCharge">
            <base-input-number v-model="form.payCharge" placeholder="请输入手续费" />
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

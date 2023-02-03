<script>
import {
  getAcctLetterOfCreditPresentById,
  saveAcctLetterOfCreditPresent,
  updateAcctLetterOfCreditPresent
} from '@/api/finance/acct-letter-of-credit-present'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  receiptNo: '',
  receiptId: 0,
  presentNo: '',
  presentDate: '',
  currencyName: '',
  presentMoney: '',
  payDate: '',
  acceptanceDate: '',
  remark: ''
}

export default {
  name: 'EnterFormCreditPresent',

  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    tableRow: Object,
    mainRow: Object,
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    options: {
      type: Array,
      default: () => []
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
        presentDate: [{ required: true, message: '交单日期必填' }],
        currencyName: [{ required: true, message: '交单币别必填' }],
        receiptNo: [{ required: true, message: '收款单编号必填' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        Promise.all([
          getDataDictionary([]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctLetterOfCreditPresentById(this.mainRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
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
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const formData = Object.assign(this.form, { creditId: this.tableRow.id })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveAcctLetterOfCreditPresent(formData)
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
            updateAcctLetterOfCreditPresent(formData)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="12">
          <base-form-item label="交单编号" prop="presentNo">
            <base-input v-model="form.presentNo" placeholder="请输入交单编号" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="交单日期" prop="presentDate">
            <base-date-picker v-model="form.presentDate" type="date" placeholder="选择交单日期" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="交单币别" prop="currencyName">
            <business-autocomplete-basic
              v-model="form.currencyName"
              label="交单币别"
              placeholder="请输入交单币别"
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="交单金额" prop="presentMoney">
            <base-input-number v-model="form.presentMoney" placeholder="请输入交单金额" :precision="2" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="收款单编号" prop="receiptNo">
            <business-autocomplete-basic
              v-model="form.receiptNo"
              label="收款单编号"
              placeholder="请输入收款单编号"
              :module-name="constant.AUTOCOMPLETE_KEY_ACCT_RECEIPT"
              :params="{
                receiptMode: enums.RECEIPT_MODE.getFieldByKey('LETTER_OF_CREDIT')
              }"
              :auto-assign="{
                receiptId: 'id'
              }"
              :form="form"
              @clear="() => (form.receiptId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="最迟付款日期" prop="payDate">
            <base-date-picker v-model="form.payDate" type="date" placeholder="选择最迟付款日期" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="最迟确认日期" prop="acceptanceDate">
            <base-date-picker v-model="form.acceptanceDate" type="date" placeholder="选择最迟确认日期" />
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

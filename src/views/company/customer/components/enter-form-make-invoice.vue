<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { saveCompanyInvoice, updateCompanyInvoice, getCompanyInvoiceById } from '@/api/company/company-invoice'

const form = {
  bankName: '',
  bankNo: '',
  invoiceTitle: '',
  invoiceType: enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
  registerAddress: '',
  registerTel: '',
  creditCode: '',
  remark: '',
  companyId: '',
  customerId: ''
}

export default {
  name: 'EnterFormMakeInvoice',

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
        creditCode: [{ required: true, message: '纳税识别号必填' }],
        invoiceTitle: [{ required: true, message: '发票抬头必填' }],
        bankName: [{ required: true, message: '开户银行名称必填' }],
        invoiceType: [{ required: true, message: '发票开具类型必填' }],
        bankNo: [{ required: true, message: '基本开户账号必填' }],
        registerAddress: [{ required: true, message: '注册场所地址' }],
        registerTel: [{ required: true, message: '注册固定电话' }]
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
        const { DICTS_INVOICE_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_INVOICE_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCompanyInvoiceById(this.mainRow.id)
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
          const formData = Object.assign(this.form, { customerId: this.tableRow.id }, { companyId: this.tableRow.companyId })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveCompanyInvoice(formData)
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
            updateCompanyInvoice(formData)
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
    width="500px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
      <base-row :gutter="20">
        <base-col :span="24">
          <base-form-item label="开票抬头" prop="invoiceTitle">
            <base-input v-model="form.invoiceTitle" placeholder="请输入开票抬头"></base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="发票工具类型" prop="invoiceType">
            <base-select v-model="form.invoiceType" placeholder="请输入发票工具类型" :options="dicts[constant.DICTS_INVOICE_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="纳税识别号" prop="creditCode">
            <base-input v-model="form.creditCode" placeholder="请输入纳税识别号"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="开户银行名称" prop="bankName">
            <base-input v-model="form.bankName" placeholder="请输入开户银行名称"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="基本开户账号" prop="bankNo">
            <base-input v-model="form.bankNo" placeholder="请输入基本开户账号"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="注册场所地址" prop="registerAddress">
            <base-input v-model="form.registerAddress" placeholder="请输入注册场所地址"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="固定电话" prop="registerTel">
            <base-input v-model="form.registerTel" placeholder="请输入固定电话"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

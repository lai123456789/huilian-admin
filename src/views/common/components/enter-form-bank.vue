<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { getCompanyBankById, saveCompanyBank, updateCompanyBank } from '@/api/company/company-bank'

const form = {
  bankName: '',
  accountCode: '',
  accountName: '',
  bankAddress: '',
  region: enums.COMPANY_REGION.getFieldByKey('DOMESTIC'),
  swiftCode: '',
  remark: '',
  companyId: ''
}

export default {
  name: 'EnterFormBank',

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
        bankName: [{ required: true, message: '银行名称必填' }],
        accountCode: [{ required: true, message: '银行账号' }],
        accountName: [{ required: true, message: '开户名称必填' }],
        swiftCode: [{ required: true, message: '国际银联号必填' }]
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
        const { DICTS_COMPANY_REGION } = constant
        Promise.all([
          getDataDictionary([DICTS_COMPANY_REGION]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCompanyBankById(this.mainRow.id)
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
          const formData = Object.assign(this.form, { companyId: this.tableRow.companyId })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveCompanyBank(formData)
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
            updateCompanyBank(formData)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row :gutter="20">
        <base-col :span="24">
          <base-form-item label="银行名称" prop="bankName">
            <base-input v-model="form.bankName" placeholder="请输入银行名称"></base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="银行账号" prop="accountCode">
            <base-input v-model="form.accountCode" placeholder="请输入银行账号" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="所属区域" prop="region">
            <base-radio v-model="form.region" is-group :options="dicts[constant.DICTS_COMPANY_REGION]"></base-radio>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="开户名称" prop="accountName">
            <base-input v-model="form.accountName" placeholder="请输入开户名称"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="银行地址" prop="bankAddress">
            <base-input v-model="form.bankAddress" placeholder="请输入银行地址"> </base-input>
          </base-form-item>
        </base-col>
        <base-col v-if="form.region === enums.COMPANY_REGION.getFieldByKey('ABROAD')" :span="24">
          <base-form-item label="国际银联号" prop="swiftCode">
            <base-input v-model="form.swiftCode" placeholder="请输入国际银联号"> </base-input>
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

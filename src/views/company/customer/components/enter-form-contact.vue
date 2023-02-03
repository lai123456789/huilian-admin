<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { getCompanyPersonById, saveCompanyPerson, updateCompanyPerson } from '@/api/company/company-person'

const form = {
  id: '',
  companyId: '',
  companyNo: '',
  email: '',
  mobile: '',
  name: '',
  remark: ''
}

export default {
  name: 'EnterFormContact',

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
        name: [{ required: true, message: '联系人姓名必填' }]
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
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCompanyPersonById(this.mainRow.id)
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
            saveCompanyPerson(formData)
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
            updateCompanyPerson(formData)
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
          <base-form-item label="联系人姓名" prop="name">
            <base-input v-model="form.name" placeholder="请输入联系人姓名"></base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="联系人电话" prop="mobile">
            <base-input v-model="form.mobile" placeholder="请输入联系人电话"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="联系人邮箱" prop="email">
            <base-input v-model="form.email" placeholder="请输入联系人邮箱"> </base-input>
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

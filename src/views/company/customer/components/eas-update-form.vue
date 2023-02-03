<script>
import { updateEasNoCompanyCustomer } from '@/api/company/company-customer'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'

const form = {
  easNo: ''
}

export default {
  name: 'EasUpdateForm',
  props: {
    value: {
      type: Boolean,
      default: false
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
    return {
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        easNo: [{ required: true, message: 'EAS编码必填', trigger: 'blur' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = Object.assign(clone(form, true), this.tableRow)
        Promise.all([getDataDictionary([])]).then(([dicts]) => {
          this.dicts = dicts
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
          updateEasNoCompanyCustomer(this.form)
            .then(() => {
              this.$message.success('操作成功')
              this.visible = false
              done()
              this.reLoad(false)
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
  <base-dialog :visible.sync="visible" width="500px" title="录入EAS编码" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="EAS编码" prop="easNo">
            <base-input v-model="form.easNo" placeholder="请输入EAS编码" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<script>
import { saveAcctTaxRefundDeclaration } from '@/api/finance/acct-tax-refund-declaration'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  remark: ''
}

export default {
  name: 'EnterFormTaxDeclare',
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
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        remark: [{ required: true, message: '退税申报备注必填' }]
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
        const { DICTS_FUNCTION_CALL_STATUS } = constant
        Promise.all([getDataDictionary([DICTS_FUNCTION_CALL_STATUS])]).then(([dicts]) => {
          this.dicts = dicts
          Object.assign(this.form, this.tableRow)
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
          saveAcctTaxRefundDeclaration(this.form)
            .then(() => {
              this.$message.success('操作成功')
              this.reLoad()
              this.visible = false
              done()
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
  <base-dialog :visible.sync="visible" width="500px" title="生成退税申报" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="退税申报备注" prop="remark">
            <base-input v-model="form.remark" placeholder="请输入退税申报备注" type="textarea" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

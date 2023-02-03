<script>
import { inputAcctMakeInvoice } from '@/api/finance/acct-make-invoice'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  taxCode: '',
  taxDate: '',
  taxNo: ''
}

export default {
  name: 'EnterFormInputTax',
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
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        taxDate: [{ required: true, message: '开票日期必填' }],
        taxCode: [{ required: true, message: '发票代码必填' }],
        taxNo: [{ required: true, message: '发票号码必填' }]
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
          inputAcctMakeInvoice(this.form)
            .then(() => {
              this.$message.success('操作成功!')
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
  <base-dialog :visible.sync="visible" width="500px" title="录入税票信息 " @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="开票日期" prop="taxDate">
            <base-date-picker v-model="form.taxDate" type="date" placeholder="选择开票日期" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="发票代码" prop="taxCode">
            <base-input v-model="form.taxCode" placeholder="请输入发票代码" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="发票号码" prop="taxNo">
            <base-input v-model="form.taxNo" placeholder="请输入发票号码" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

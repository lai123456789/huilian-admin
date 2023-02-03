<script>
import { refundToAccountAcctTaxRefundDeclaration } from '@/api/finance/acct-tax-refund-declaration'
import { getDataDictionary } from '@/api/admin/dicts'
import { validatorNumRequired } from '@/utils/validate'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  taxRefundDate: '',
  taxRefundMoney: '',
  remark: ''
}

export default {
  name: 'EnterFormTaxAccount',
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
        taxRefundDate: [{ required: true, message: '	到账日期必填' }],
        taxRefundMoney: [{ required: true, message: '退账金额必填', validator: validatorNumRequired }],
        remark: [{ required: true, message: '备注必填' }]
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
        Promise.all([getDataDictionary([])]).then(([dicts]) => {
          this.dicts = dicts
          const { id, taxRefundDate, taxRefundMoney, remark } = this.tableRow
          Object.assign(this.form, { id, taxRefundDate, taxRefundMoney, remark })
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
          refundToAccountAcctTaxRefundDeclaration(this.form)
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
  <base-dialog :visible.sync="visible" width="500px" title="退税到账" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="到账日期" prop="taxRefundDate">
            <base-date-picker v-model="form.taxRefundDate" type="date" placeholder="选择到账日期" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="退账金额" prop="taxRefundMoney">
            <base-input-number v-model="form.taxRefundMoney" placeholder="请输入退账金额" :precision="2" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" placeholder="请输入备注" type="textarea" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

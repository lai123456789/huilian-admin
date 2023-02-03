<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { validatorNumRequired } from '@/utils/validate'
import { settleAdvanceacctCostInvoice } from '@/api/finance/acct-cost-invoice'

const form = {
  costInvoiceId: 0,
  receiptDate: '',
  receiptMoney: 0
}

export default {
  name: 'EnterFormInvoSettleAdvance',

  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: Object,
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
        receiptMoney: [{ required: true, message: '回款金额必填', validator: validatorNumRequired }],
        receiptDate: [{ required: true, message: '回款日期必填' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        Promise.all([getDataDictionary([])]).then(([dicts]) => {
          const { costInvoiceId, unSettleAdvanceMoney } = this.tableRow
          this.dicts = dicts
          this.form = Object.assign(clone(form, true), {
            costInvoiceId,
            receiptMoney: unSettleAdvanceMoney
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
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          settleAdvanceacctCostInvoice(this.form)
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
  <base-dialog :visible.sync="visible" width="500px" title="结算账期" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row :gutter="20">
        <base-col :span="24">
          <base-form-item label="回款金额" prop="receiptMoney">
            <base-input-number v-model="form.receiptMoney" placeholder="请输入回款金额"></base-input-number>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="回款日期" prop="receiptMoney">
            <base-date-picker v-model="form.receiptMoney" type="time" placeholder="请选择回款日期" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

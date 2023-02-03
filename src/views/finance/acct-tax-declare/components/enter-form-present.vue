<script>
import { updateBillAcctTaxRefundDeclaration } from '@/api/finance/acct-tax-refund-declaration'
import { getDataDictionary } from '@/api/admin/dicts'
import { validatorNumRequired } from '@/utils/validate'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  billPerson: '',
  billDate: '',
  billYearMonth: '',
  billBatch: '',
  billMoney: 0,
  remark: ''
}

export default {
  name: 'EnterFormPresent',
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
        billPerson: [{ required: true, message: '交单人必填' }],
        billDate: [{ required: true, message: '交单日期必填' }],
        billBatch: [{ required: true, message: '交单批次必填' }],
        billMoney: [{ required: true, message: '交单金额必填', validator: validatorNumRequired }],
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
          const { id, billPerson, billDate, billBatch, taxMoney: billMoney, remark } = this.tableRow
          Object.assign(this.form, { id, billPerson, billDate, billYearMonth: billDate, billBatch, billMoney, remark })
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleBillDateChange(val) {
      this.form.billYearMonth = val
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          updateBillAcctTaxRefundDeclaration(this.form)
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
  <base-dialog :visible.sync="visible" width="500px" title="交单" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="交单人" prop="billPerson">
            <business-autocomplete-basic
              v-model="form.billPerson"
              key-field="userId"
              label="交单人"
              placeholder="请输入交单人"
              :module-name="constant.AUTOCOMPLETE_KEY_CONSUMER"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="交单日期" prop="billDate">
            <base-date-picker v-model="form.billDate" type="date" placeholder="选择交单日期" @change="handleBillDateChange" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="交单年月" prop="billYearMonth">
            <base-date-picker
              v-model="form.billYearMonth"
              disabled
              type="month"
              value-format="yyyy-MM"
              format="yyyy-MM"
              placeholder="选择交单年月"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="交单批次" prop="billBatch">
            <base-input v-model="form.billBatch" placeholder="请输入交单批次" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="交单金额" prop="billMoney">
            <base-input-number v-model="form.billMoney" placeholder="请输入交单金额" :precision="2" />
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

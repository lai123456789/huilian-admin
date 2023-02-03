<script>
import { updateArrivalAcctBankAcceptance } from '@/api/finance/acct-bank-acceptance'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  arrivalDate: '',
  arrivalMoney: 0
}

export default {
  name: 'UpdateArrival',
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
        arrivalDate: [{ required: true, message: '到账日期必填' }],
        arrivalMoney: [{ required: true, message: '到账金额必填', validator: validatorNumRequired, trigger: 'blur' }]
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
          updateArrivalAcctBankAcceptance(this.form)
            .then(() => {
              this.$message.success('操作成功')
              this.visible = false
              done()
              this.reLoad()
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
  <base-dialog :visible.sync="visible" width="500px" title="更新到账信息 " @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="到账日期" prop="arrivalDate">
            <base-date-picker v-model="form.arrivalDate" type="date" placeholder="请选择到账日期" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="到账金额" prop="arrivalMoney">
            <base-input-number v-model="form.arrivalMoney" placeholder="请输入到账金额" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

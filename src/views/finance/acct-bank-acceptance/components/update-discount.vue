<script>
import { updateDiscountAcctBankAcceptance } from '@/api/finance/acct-bank-acceptance'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  discountId: 0,
  discountName: '',
  discountTax: '',
  discountRate: '',
  discountInterest: '',
  discountDate: '',
  discountCharge: '',
  discountBearType: '',
  discountBankName: ''
}

export default {
  name: 'UpdateDiscount',
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
        discountName: [{ required: true, message: '贴现人必填' }],
        discountRate: [{ required: true, message: '贴现率必填', validator: validatorNumRequired, trigger: 'blur' }],
        discountInterest: [{ required: true, message: '贴现息必填', validator: validatorNumRequired, trigger: 'blur' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      const { DICTS_TAX_RATE, DICTS_DISCOUNT_BEAR_TYPE } = constant
      const {
        acceptanceId,
        discountName,
        discountTax,
        discountRate,
        discountInterest,
        discountDate,
        discountCharge,
        discountBearType,
        discountBankName
      } = this.tableRow
      if (newValue) {
        this.form = Object.assign(clone(form, true), {
          acceptanceId,
          discountName,
          discountTax: String(discountTax),
          discountRate,
          discountInterest,
          discountDate,
          discountCharge,
          discountBearType,
          discountBankName
        })
        Promise.all([getDataDictionary([DICTS_TAX_RATE, DICTS_DISCOUNT_BEAR_TYPE])]).then(([dicts]) => {
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
          updateDiscountAcctBankAcceptance(this.form)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="贴现人" prop="discountName">
            <business-autocomplete-basic
              v-model="form.discountName"
              key-field="userId"
              label="贴现人"
              placeholder="请输入贴现人"
              :module-name="constant.AUTOCOMPLETE_KEY_CONSUMER"
              :auto-assign="{
                discountId: 'userId'
              }"
              :form="form"
              @clear="() => (form.discountId = 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="贴现税点" prop="discountTax">
            <base-select v-model="form.discountTax" placeholder="请选择贴现税点" :options="dicts[constant.DICTS_TAX_RATE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="贴现率" prop="discountRate">
            <base-input-number v-model="form.discountRate" placeholder="请输入贴现率" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="贴现息" prop="discountInterest">
            <base-input-number v-model="form.discountInterest" placeholder="请输入贴现息" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="贴现日期" prop="discountDate">
            <base-date-picker v-model="form.discountDate" type="date" placeholder="请选择贴现日期" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="贴现息承担方" prop="discountBearType">
            <base-select
              v-model="form.discountBearType"
              placeholder="请选择贴现息承担方"
              :options="dicts[constant.DICTS_DISCOUNT_BEAR_TYPE]"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="贴现手续费" prop="discountCharge">
            <base-input-number v-model="form.discountCharge" placeholder="请输入贴现手续费" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="贴现银行" prop="discountBankName">
            <base-input v-model="form.discountBankName" placeholder="请输入贴现银行" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

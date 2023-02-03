<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

const form = {
  qty: 0,
  price: 0,
  totalMoney: 0
}

export default {
  name: 'EnterFormModifyPrice',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
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
        price: [{ required: true, message: '单价必填', validator: validatorNumRequired, trigger: 'blur' }]
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
    calcPrice(type) {
      const { totalMoney, qty, price } = this.form
      if (type === 'totalMoney') {
        if (qty) {
          this.form.price = new BigNumber(totalMoney).div(qty).dp(6).toNumber()
        }
      } else {
        this.form.totalMoney = new BigNumber(qty).times(price).dp(2).toNumber()
      }
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.$emit('save', this.form, done)
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
  <base-dialog :visible.sync="visible" width="700px" title="修改价格" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="60px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="数量" prop="qty">
            <base-input-number v-model="form.qty" readonly placeholder="请输入数量" @blur="calcPrice('qty')" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="单价" prop="price">
            <base-input-number v-model="form.price" :precision="6" placeholder="请输入单价" @blur="calcPrice('price')" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="总价" prop="totalMoney">
            <base-input-number v-model="form.totalMoney" placeholder="请输入总价" @blur="calcPrice('totalMoney')" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { validatorNumRequired } from '@/utils/validate'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  netWeight: 0,
  grossWeight: 0,
  grossWeightRule: enums.GROSS_WEIGHT_RULE.getFieldByKey('NUM')
}

export default {
  name: 'EnterFormApportion',
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
    const handleValidCustom = (_a, _b, callback) => {
      if (this.form.netWeight === 0 && this.form.grossWeight === 0) {
        callback(new Error('净重和毛重不能都为0'))
      }
      callback()
    }
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        netWeight: [{ validator: handleValidCustom, trigger: 'blur' }],
        grossWeight: [{ validator: handleValidCustom, trigger: 'blur' }]
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
        const { DICTS_GROSS_WEIGHT_RULE } = constant
        Promise.all([getDataDictionary([DICTS_GROSS_WEIGHT_RULE])]).then(([dicts]) => {
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
    handleValidCustom(_a, _b, callback) {
      if (this.form.netWeight === 0 && this.form.grossWeight === 0) {
        callback(new Error('净重和毛重不能都为0'))
      }
      callback()
    },
    validatorNumRequired,
    handleGrossWeightRuleChange() {
      this.form.netWeight = 0
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
  <base-dialog :visible.sync="visible" width="500px" title="分摊毛净重" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="毛重分摊规则" prop="grossWeightRule">
            <base-radio
              v-model="form.grossWeightRule"
              is-group
              :options="dicts[constant.DICTS_GROSS_WEIGHT_RULE]"
              @change="handleGrossWeightRuleChange"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item
            label="净重"
            prop="netWeight"
            :rules="form.grossWeightRule === enums.GROSS_WEIGHT_RULE.getFieldByKey('NUM') ? [{ validator: handleValidCustom }] : []"
          >
            <base-input-number v-model="form.netWeight" :precision="2" placeholder="请输入净重" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item
            label="毛重"
            prop="grossWeight"
            :rules="
              form.grossWeightRule === enums.GROSS_WEIGHT_RULE.getFieldByKey('NUM')
                ? [{ validator: handleValidCustom }]
                : [{ required: true, message: '毛重必填', validator: validatorNumRequired }]
            "
          >
            <base-input-number v-model="form.grossWeight" :precision="2" placeholder="请输入毛重" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

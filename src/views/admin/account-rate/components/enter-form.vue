<script>
import { getBaseAccountRateById, saveBaseAccountRate, updateBaseAccountRate } from '@/api/base/base-account-rate'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

const form = {
  rate: 0,
  originalCurrency: '',
  baseCurrency: '',
  year: '',
  month: ''
}

export default {
  name: 'EnterForm',
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
        year: [{ required: true, message: '年份必填', trigger: 'blur' }],
        month: [{ required: true, message: '月份必填', trigger: 'blur' }],
        rate: [{ required: true, message: '汇率必填', trigger: 'blur' }],
        originalCurrency: [{ required: true, message: '原币必填', trigger: 'blur' }],
        baseCurrency: [{ required: true, message: '本位币必填', trigger: 'blur' }]
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
        Promise.all([
          getDataDictionary([]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseAccountRateById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, { rate: new BigNumber(Number(info.data.rate)).times(100).toNumber() })
          }
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
          const formData = Object.assign(clone(this.form, true), {
            rate: new BigNumber(Number(this.form.rate)).div(100).toNumber()
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveBaseAccountRate(formData)
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
            updateBaseAccountRate(formData)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}成功`)
                this.visible = false
                done()
                // 刷新表格的时候，保存之前选中的数据
                this.reLoad(true)
              })
              .catch(() => {
                done()
              })
          }
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
  <base-dialog
    :visible.sync="visible"
    width="500px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="年份" prop="year">
            <base-date-picker v-model="form.year" type="year" placeholder="选择年份" format="yyyy" value-format="yyyy" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="月份" prop="month">
            <base-date-picker
              v-model="form.month"
              type="month"
              placeholder="选择月份"
              popper-class="date-picker-no-header"
              format="MM"
              value-format="MM"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="汇率" prop="rate">
            <base-input-number v-model="form.rate" :min="0" :precision="4" placeholder="请输入汇率" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="原币" prop="originalCurrency">
            <business-autocomplete-basic
              v-model="form.originalCurrency"
              label="原币"
              placeholder="请输入原币"
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="本位币" prop="baseCurrency">
            <business-autocomplete-basic
              v-model="form.baseCurrency"
              label="本位币"
              placeholder="请输入本位币"
              :form="form"
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

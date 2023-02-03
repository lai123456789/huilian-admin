<script>
import { getBaseUnitConvertById, saveBaseUnitConvert, updateBaseUnitConvert } from '@/api/base/base-unit-convert'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

const form = {
  fromUnit: '',
  toUnit: '',
  convertNum: 0
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
        fromUnit: [{ required: true, message: '转换前单位必填', trigger: 'blur' }],
        toUnit: [{ required: true, message: '转换后单位必填', trigger: 'blur' }],
        convertNum: [{ required: true, message: '转换系数必填', trigger: 'blur' }]
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
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseUnitConvertById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, { addRate: new BigNumber(Number(info.data.addRate)).times(100).toNumber() })
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
            addRate: new BigNumber(Number(this.form.addRate)).div(100).toNumber()
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveBaseUnitConvert(formData)
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
            updateBaseUnitConvert(formData)
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
          <base-form-item label="转换前单位" prop="fromUnit">
            <business-autocomplete-ccl
              v-model="form.fromUnit"
              label="转换前单位"
              placeholder="请输入转换前单位"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_UNIT"
            ></business-autocomplete-ccl>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="转换后单位" prop="toUnit">
            <business-autocomplete-ccl
              v-model="form.toUnit"
              label="转换后单位"
              placeholder="请输入转换后单位"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_UNIT"
            ></business-autocomplete-ccl>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="转换系数" prop="convertNum">
            <base-input-number v-model="form.convertNum" :precision="0" placeholder="请输入转换系数" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

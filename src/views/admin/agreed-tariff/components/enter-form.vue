<script>
import { getBaseAgreedTariffById, saveBaseAgreedTariff, updateBaseAgreedTariff } from '@/api/base/base-agreed-tariff'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

const form = {
  agreedRate: 0,
  customsCode: '',
  country: ''
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
        customsCode: [{ required: true, message: '海关编码必填', trigger: 'blur' }],
        agreedRate: [{ required: true, message: '加征关税率必填', trigger: 'blur' }],
        country: [{ required: true, message: '国家必填', trigger: 'blur' }]
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
        const { DICTS_COST_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_COST_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseAgreedTariffById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, { agreedRate: new BigNumber(Number(info.data.agreedRate)).times(100).toNumber() })
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
            agreedRate: new BigNumber(Number(this.form.agreedRate)).div(100).toNumber()
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveBaseAgreedTariff(formData)
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
            updateBaseAgreedTariff(formData)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="海关编码" prop="customsCode">
            <business-autocomplete-basic
              v-model="form.customsCode"
              label="海关编码"
              placeholder="请输入海关编码"
              :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMS_CODE"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="国家" prop="country">
            <base-input v-model="form.country" placeholder="请输入国家" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="协定关税率" prop="agreedRate">
            <base-input-number v-model="form.agreedRate" placeholder="请输入协定关税率">
              <template slot="append">%</template>
            </base-input-number>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="排序" prop="sort">
            <base-input-number v-model="form.sort" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

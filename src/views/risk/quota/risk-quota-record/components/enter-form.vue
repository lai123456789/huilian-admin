<script>
import { getRiskCusQuotaRecordById, saveRiskCusQuotaRecord, updateRiskCusQuotaRecord } from '@/api/risk/risk-cus-quota-record'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  customerId: 0,
  customerName: '',
  currencyName: '',
  effectiveDate: '',
  expireDate: '',
  grantMode: '',
  grantMoney: 0,
  quotaType: '',
  remark: ''
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
        customerName: [{ required: true, message: '客户名称必填' }],
        currencyName: [{ required: true, message: '额度币别必填' }],
        effectiveDate: [{ required: true, message: '生效日期必填' }],
        expireDate: [{ required: true, message: '到期日期必填' }],
        quotaType: [{ required: true, message: '额度类型必填' }]
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
        const { DICTS_QUOTA_TYPE, DICTS_GRANT_MODE } = constant
        Promise.all([
          getDataDictionary([DICTS_QUOTA_TYPE, DICTS_GRANT_MODE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getRiskCusQuotaRecordById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
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
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveRiskCusQuotaRecord(this.form)
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
            updateRiskCusQuotaRecord(this.form)
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
      <base-row :gutter="10">
        <base-col :span="24">
          <base-form-item label="客户名称" prop="customerName">
            <business-autocomplete-basic
              v-model="form.customerName"
              label="客户名称"
              placeholder="请输入客户名称"
              :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
              :auto-assign="{
                customerId: 'id'
              }"
              :form="form"
              @clear="() => (form.customerId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="额度类型" prop="quotaType">
            <base-select v-model="form.quotaType" placeholder="请选择额度类型" :options="dicts[constant.DICTS_QUOTA_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="授信模式" prop="grantMode">
            <base-select v-model="form.grantMode" placeholder="请选择授信模式" :options="dicts[constant.DICTS_GRANT_MODE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="额度币别" prop="currencyName">
            <business-autocomplete-basic
              v-model="form.currencyName"
              label="额度币别"
              placeholder="请输入额度币别"
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="授信金额" prop="grantMoney">
            <base-input-number v-model="form.grantMoney" placeholder="请输入授信金额" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="生效日期" prop="effectiveDate">
            <base-date-picker v-model="form.effectiveDate" type="date" placeholder="选择生效日期" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="到期日期" prop="expireDate">
            <base-date-picker v-model="form.expireDate" type="date" placeholder="选择到期日期" />
          </base-form-item>
        </base-col>
      </base-row>

      <base-row :gutter="10">
        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

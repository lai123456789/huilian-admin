<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  originCountry: '',
  originCountryCode: void 0,
  district: '',
  districtCode: void 0,
  dest: '',
  destCode: void 0,
  dutyMode: '',
  dutyModeCode: void 0
}

export default {
  name: 'MaimBulkEdit',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderType: String,
    getVxeGridInstance: Function
  },
  data() {
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {},
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
          const checkboxRecords = this.getVxeGridInstance().getVxeGridInstance().getCheckboxRecords()
          checkboxRecords.forEach(v => {
            v = Object.assign(v, this.form)
          })
          this.$message.success('操作成功')
          this.visible = false
          done()
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
  <base-dialog :visible.sync="visible" width="500px" title="批量修改" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="原产国(地区)" prop="originCountry">
            <business-autocomplete-ccl
              v-model="form.originCountry"
              :clearable="false"
              label="原产国(地区)"
              placeholder="请输入原产国(地区)"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
              :auto-assign="{
                originCountryCode: 'code'
              }"
              :form="form"
              @clear="() => (form.originCountryCode = void 0)"
            >
              >
              <template v-slot="{ option }">
                <span>{{ `${option.code} ${option.name}` }}</span>
              </template>
            </business-autocomplete-ccl>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '境内目的地代码' : '境内货源地'" prop="district">
            <business-autocomplete-ccl
              v-model="form.district"
              :clearable="false"
              :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '境内目的地代码' : '境内货源地'"
              :placeholder="`请输入${orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '境内目的地代码' : '境内货源地'}`"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTRICT"
              :auto-assign="{
                districtCode: 'code'
              }"
              :form="form"
              @clear="() => (form.districtCode = void 0)"
            >
              >
              <template v-slot="{ option }">
                <span>{{ `${option.code} ${option.name}` }}</span>
              </template>
            </business-autocomplete-ccl>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '目的地代码' : '产地代码'" prop="dest">
            <business-autocomplete-ccl
              v-model="form.dest"
              :clearable="false"
              :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '目的地代码' : '产地代码'"
              :placeholder="`请输入${orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '目的地代码' : '产地代码'}`"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_DEST_CODE"
              :auto-assign="{
                destCode: 'code'
              }"
              :form="form"
              @clear="() => (form.destCode = void 0)"
            >
              >
              <template v-slot="{ option }">
                <span>{{ `${option.code} ${option.name}` }}</span>
              </template>
            </business-autocomplete-ccl>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="征免方式" prop="dutyMode">
            <business-autocomplete-ccl
              v-model="form.dutyMode"
              :clearable="false"
              label="征免方式"
              placeholder="请输入征免方式"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_LEVY_TYPE"
              :auto-assign="{
                dutyModeCode: 'code'
              }"
              :form="form"
              @clear="() => (form.dutyModeCode = void 0)"
            >
              >
              <template v-slot="{ option }">
                <span>{{ `${option.code} ${option.name}` }}</span>
              </template>
            </business-autocomplete-ccl>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

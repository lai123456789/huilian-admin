<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { getCompanyCusCustomerById, saveCompanyCusCustomer, updateCompanyCusCustomer } from '@/api/company/company-cus-customer'

const form = {
  companyAddress: '',
  companyAddressEn: '',
  companyName: '',
  companyNameEn: '',
  companyRegion: '',
  createBy: '',
  createByName: '',
  createTime: '',
  customerId: '',
  id: '',
  mobile: '',
  person: '',
  phone: '',
  remark: ''
}

export default {
  name: 'EnterFormCusCustomer',

  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    tableRow: Object,
    mainRow: Object,
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    options: {
      type: Array,
      default: () => []
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
        companyName: [{ required: true, message: '企业名称必填' }],
        companyRegion: [{ required: true, message: '所属区域必填' }]
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
        const { DICTS_COMPANY_REGION } = constant
        Promise.all([
          getDataDictionary([DICTS_COMPANY_REGION]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCompanyCusCustomerById(this.mainRow.id)
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
    onCompanyNameSelect(rows) {
      const { companyName, companyAddress, companyAddressEn, companyRegion, phone, person, mobile } = rows[0]
      Object.assign(this.form, {
        companyName,
        companyAddress,
        companyAddressEn,
        companyRegion,
        phone,
        person,
        mobile
      })
    },
    onCompanyNameClear() {
      this.form = clone(form, true)
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const formData = Object.assign(this.form, { customerId: this.tableRow.id }, { companyId: this.tableRow.companyId })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveCompanyCusCustomer(formData)
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
            updateCompanyCusCustomer(formData)
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
      <base-row :gutter="20">
        <base-col :span="24">
          <base-form-item label="企业名称" prop="companyName">
            <business-autocomplete-basic
              v-model="form.companyName"
              label="企业名称"
              placeholder="请输入企业名称"
              :is-exist="false"
              :module-name="constant.AUTOCOMPLETE_KEY_COMPANY"
              @select="onCompanyNameSelect"
              @clear="onCompanyNameClear"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="企业英文名称" prop="companyNameEn">
            <base-input v-model="form.companyNameEn" placeholder="请输入企业英文名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="企业地址" prop="companyAddress">
            <base-input v-model="form.companyAddress" placeholder="请输入企业地址"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="企业英文地址" prop="companyAddressEn">
            <base-input v-model="form.companyAddressEn" placeholder="请输入企业英文地址"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="所属区域" prop="companyRegion">
            <base-select v-model="form.companyRegion" placeholder="请输入所属区域" :options="dicts[constant.DICTS_COMPANY_REGION]" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="手机号" prop="mobile">
            <base-input v-model="form.mobile" placeholder="请输入手机号"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="联系人" prop="person">
            <base-input v-model="form.person" placeholder="请输入联系人"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="座机" prop="phone">
            <base-input v-model="form.phone" placeholder="请输入座机"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

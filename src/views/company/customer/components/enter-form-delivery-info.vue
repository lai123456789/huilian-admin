<script>
import { getCompanyCusDeliveryById, saveCompanyCusDelivery, updateCompanyCusDelivery } from '@/api/company/company-cus-delivery'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  id: '',
  addressType: '',
  createBy: '',
  createByName: '',
  createTime: '',
  customerId: '',
  defaultFlag: enums.WHETHER_STATUS.getFieldByKey('YES'),
  deliveryAddress: '',
  deliveryCompany: '',
  mobile: '',
  person: '',
  remark: ''
}

export default {
  name: 'EnterFormDeliveryInfo',

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
        deliveryAddress: [{ required: true, message: '收货地址', trigger: 'blur' }]
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
        const { DICTS_ADDRESS_TYPE, DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_ADDRESS_TYPE, DICTS_WHETHER_STATUS]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCompanyCusDeliveryById(this.mainRow.id)
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
          const formData = Object.assign(this.form, { customerId: this.tableRow.id })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveCompanyCusDelivery(formData)
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
            updateCompanyCusDelivery(formData)
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
      <base-row :gutter="10">
        <base-col :span="24">
          <base-form-item label="收货公司" prop="deliveryCompany">
            <base-input v-model="form.deliveryCompany" placeholder="请输入收货公司"></base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="地址类型" prop="addressType">
            <base-select v-model="form.addressType" placeholder="请输入收货类型" :options="dicts[constant.DICTS_ADDRESS_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="收货地址" prop="deliveryAddress">
            <base-input v-model="form.deliveryAddress" placeholder="请输入收货地址"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="是否默认" prop="defaultFlag">
            <base-radio v-model="form.defaultFlag" is-group :options="dicts[constant.DICTS_WHETHER_STATUS]"></base-radio>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="联系人" prop="person">
            <base-input v-model="form.person" placeholder="请输入联系人"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="联系电话" prop="mobile">
            <base-input v-model="form.mobile" placeholder="请输入联系电话"> </base-input>
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

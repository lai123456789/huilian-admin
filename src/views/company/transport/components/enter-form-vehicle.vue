<script>
import { getCompanyTranVehicleById, saveCompanyTranVehicle, updateCompanyTranVehicle } from '@/api/company/company-tran-vehicle'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  plateNo: '',
  plateNoHk: '',
  tonnage: '',
  maxPayload: '',
  person: '',
  mobile: '',
  idCard: '',
  recordNo: '',
  tradingType: '',
  carType: '',
  sort: 1,
  remark: '',
  companyId: ''
}

export default {
  name: 'EnterFormDriver',
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
        plateNo: [{ required: true, message: '大陆车牌必填', trigger: 'blur' }],
        tradingType: [{ required: true, message: '进出口标志必填', trigger: 'blur' }]
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
        const { DICTS_IEF_LAG, DICTS_HIRING_TAXIE_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_IEF_LAG, DICTS_HIRING_TAXIE_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCompanyTranVehicleById(this.mainRow.id)
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
          const formData = Object.assign(this.form, { customerId: this.tableRow.id }, { companyId: this.tableRow.companyId })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveCompanyTranVehicle(formData)
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
            updateCompanyTranVehicle(formData)
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
          // 通过 base-message 的形式展示错误信息
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
    width="700px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row>
        <base-col :span="12">
          <base-form-item label="大陆车牌" prop="plateNo">
            <base-input v-model="form.plateNo" placeholder="请输入大陆车牌" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="香港车牌" prop="plateNoHk">
            <base-input v-model="form.plateNoHk" placeholder="请输入香港车牌" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="进出口标志" prop="tradingType">
            <base-select v-model="form.tradingType" placeholder="请选择进出口标志" :options="dicts[constant.DICTS_IEF_LAG]" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="订车类型" prop="carType">
            <base-select v-model="form.carType" placeholder="请选择订车类型" :options="dicts[constant.DICTS_HIRING_TAXIE_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="吨位" prop="tonnage">
            <base-input v-model="form.tonnage" placeholder="请输入吨位" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="最大载重" prop="maxPayload">
            <base-input v-model="form.maxPayload" placeholder="请输入最大载重" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="备案号" prop="recordNo">
            <base-input v-model="form.recordNo" placeholder="请输入备案号" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="司机" prop="person">
            <base-input v-model="form.person" placeholder="请输入司机" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="手机号" prop="mobile">
            <base-input v-model="form.mobile" placeholder="请输入手机号" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="身份证号" prop="idCard">
            <base-input v-model="form.idCard" placeholder="请输入身份证号" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="排序" prop="sort">
            <base-input-number v-model="form.sort" controls align="center" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

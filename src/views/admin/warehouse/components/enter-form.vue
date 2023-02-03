<script>
import { getBaseWareHouseById, saveBaseWareHouse, updateBaseWareHouse } from '@/api/base/base-ware-house'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  warehouseName: '',
  warehouseAddress: '',
  region: enums.COMPANY_REGION.getFieldByKey('DOMESTIC'),
  status: enums.ENABLE_DISABLE.getFieldByKey('DISABLE'),
  person: '',
  mobile: '',
  phone: '',
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
        warehouseName: [{ required: true, message: '仓库名称必填', trigger: 'blur' }],
        warehouseAddress: [{ required: true, message: '仓库地址必填', trigger: 'blur' }],
        person: [{ required: true, message: '管理人必填', trigger: 'blur' }]
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
        const { DICTS_COMPANY_REGION, DICTS_ENANLE_DISABLE } = constant
        Promise.all([
          getDataDictionary([DICTS_COMPANY_REGION, DICTS_ENANLE_DISABLE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseWareHouseById(this.tableRow.id)
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
            saveBaseWareHouse(this.form)
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
            updateBaseWareHouse(this.form)
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
          <base-form-item label="状态" prop="status">
            <base-radio v-model="form.status" is-group :options="dicts[constant.DICTS_ENANLE_DISABLE]"></base-radio>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="仓库名称" prop="warehouseName">
            <base-input v-model="form.warehouseName" placeholder="请输入仓库名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="仓库地址" prop="warehouseAddress">
            <base-input v-model="form.warehouseAddress" placeholder="请输入仓库地址" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="所属区域" prop="region">
            <base-radio v-model="form.region" is-group :options="dicts[constant.DICTS_COMPANY_REGION]"></base-radio>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="管理员" prop="person">
            <base-input v-model="form.person" placeholder="请输入管理员" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="手机号" prop="mobile">
            <base-input v-model="form.mobile" placeholder="请输入手机号" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="座机" prop="phone">
            <base-input v-model="form.phone" placeholder="请输入座机" />
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

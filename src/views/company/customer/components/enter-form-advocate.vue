<script>
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { getDataDictionary } from '@/api/admin/dicts'
import { getCompanyCusManagerById, saveCompanyCusManager, updateCompanyCusManager } from '@/api/company/company-cus-manager'
import { getRole } from '@/api/admin/role'

const form = {
  userId: 0,
  userName: '',
  roleCode: ''
}

export default {
  name: 'EnterFormAdvocate',

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
        userName: [{ required: true, message: '客户维护人必填' }],
        roleCode: [{ required: true, message: '角色名称必填' }]
      },
      dicts: {},
      roleOpts: []
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
          getRole({ size: -1 }),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCompanyCusManagerById(this.mainRow.id)
        ]).then(([dicts, roles, info]) => {
          this.dicts = dicts
          this.roleOpts = roles.data.records.map(v => ({ label: v.roleName, value: v.roleCode }))
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
            saveCompanyCusManager(formData)
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
            updateCompanyCusManager(formData)
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
          <base-form-item label="角色名称" prop="roleCode">
            <base-select v-model="form.roleCode" placeholder="请输入角色名称" :options="roleOpts" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="维护人名称" prop="userName">
            <business-autocomplete-basic
              v-model="form.userName"
              key-field="userId"
              label="维护人名称"
              placeholder="请输入维护人名称"
              :params="{
                roleCodeList: form.roleCode
              }"
              :module-name="constant.AUTOCOMPLETE_KEY_CONSUMER"
              :auto-assign="{
                userId: 'userId'
              }"
              :form="form"
              @clear="() => (form.userId = 0)"
            />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

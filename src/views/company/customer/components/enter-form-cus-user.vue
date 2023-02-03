<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import encryption from '@/utils/aes'
import { getCusUserById, saveCusUser, updateCusUser } from '@/api/admin/cus-user'

const form = {
  customerId: '',
  email: '',
  lockFlag: enums.LOCKFLAG.getFieldByKey('LOCK'),
  nickname: '',
  password: '',
  phone: '',
  realname: '',
  sex: enums.WHETHER_STATUS.getFieldByKey('NO'),
  username: ''
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
        realname: [{ required: true, message: '姓名必填' }],
        username: [
          { required: true, message: '用户名必填' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符' }
        ],
        password: [{ required: true, message: '密码必填' }]
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
        const { DICTS_LOCK_FLAG, DICTS_SEX } = constant
        Promise.all([
          getDataDictionary([DICTS_LOCK_FLAG, DICTS_SEX]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCusUserById(this.mainRow.userId)
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
          if (this.form.password !== '') {
            const encrypt = encryption({
              data: { password: this.form.password },
              key: 'Ascp@10240000000',
              param: ['password']
            })
            this.form.password = encrypt.password
          }
          const formData = Object.assign(clone(this.form, true), { customerId: this.tableRow.id })
          formData.password = this.form.password
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveCusUser(formData)
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
            formData.userId = this.mainRow.userId
            updateCusUser(formData)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row :gutter="10">
        <base-col :span="24">
          <base-form-item label="姓名" prop="realname">
            <base-input v-model="form.realname" placeholder="请输入姓名"></base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="用户名" prop="username">
            <base-input v-model="form.username" placeholder="请输入用户名" :disabled="type === enums.FORM_TYPE.getFieldByKey('MODIFY')">
            </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="密码" prop="password">
            <base-input v-model="form.password" placeholder="请输入密码" show-password> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="手机号" prop="phone">
            <base-input v-model="form.phone" placeholder="请输入手机号"> </base-input>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="性别" prop="sex">
            <base-radio v-model="form.sex" is-group :options="dicts[constant.DICTS_SEX]"></base-radio>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="状态" prop="lockFlag">
            <base-radio v-model="form.lockFlag" is-group :options="dicts[constant.DICTS_LOCK_FLAG]"></base-radio>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

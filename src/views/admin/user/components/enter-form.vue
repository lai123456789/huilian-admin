<script>
import { getUserById, saveUser, updateUser } from '@/api/admin/user'
import { getRoleList } from '@/api/admin/role'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import encryption from '@/utils/aes'

const form = {
  userId: '',
  username: '',
  realname: '',
  password: '',
  deptId: '',
  phone: '',
  roleIds: [],
  lockFlag: enums.LOCKFLAG.getFieldByKey('LOCK'),
  sex: enums.SEX.getFieldByKey('MAN')
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
    },
    deptObj: Object
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
        realname: [{ required: true, message: '姓名必填', trigger: 'blur' }],
        username: [
          { required: true, message: '用户名必填', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        deptId: [{ required: true, message: '所属部门必填', trigger: 'blur' }],
        roleIds: [{ required: true, message: '角色必填', trigger: 'blur' }]
      },
      dicts: {},
      roleOptions: []
    }
  },
  computed: {
    validatePassword() {
      return [
        { required: this.type === enums.FORM_TYPE.getFieldByKey('ADDED'), message: '密码必填' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符' }
      ]
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_SEX, DICTS_LOCK_FLAG } = constant
        Promise.all([
          getDataDictionary([DICTS_SEX, DICTS_LOCK_FLAG]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getUserById(this.tableRow.userId),
          getRoleList({ size: -1 })
        ]).then(([dicts, info, roles]) => {
          this.dicts = dicts
          this.roleOptions = roles.data.map(v => ({ label: v.roleName, value: v.roleId }))
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              roleIds: info.data.roleList.map(v => v.roleId)
            })
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
          let password = this.form.password
          if (this.form.password !== '') {
            const encrypt = encryption({
              data: { password: this.form.password },
              key: 'Ascp@10240000000',
              param: ['password']
            })
            password = encrypt.password
          }
          const formData = Object.assign(clone(this.form, true), {
            password,
            deptId: this.deptObj.deptId
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveUser(formData)
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
            updateUser(formData)
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
    width="500px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="姓名" prop="realname">
            <base-input v-model="form.realname" autocomplete="off" placeholder="请输入姓名" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="用户名" prop="username">
            <base-input
              v-model="form.username"
              placeholder="请输入用户名"
              autocomplete="off"
              :disabled="type === enums.FORM_TYPE.getFieldByKey('MODIFY')"
            />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="密码" prop="password" :rules="validatePassword">
            <base-input v-model="form.password" placeholder="请输入密码" autocomplete="new-password" show-password />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="所属部门" class="tree-select" prop="deptId">
            <base-tree-select
              v-model="form.deptId"
              check-strictly
              :props="{
                value: 'id',
                label: 'name'
              }"
              :data="deptObj.depts"
              placeholder="请选择所属部门"
            />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="手机号" prop="phone">
            <base-input v-model="form.phone" placeholder="请输入手机号" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="角色" prop="roleIds">
            <base-select v-model="form.roleIds" class="role-select" multiple placeholder="请选择角色" :options="roleOptions" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="性别" prop="sex">
            <base-radio v-model="form.sex" is-group :options="dicts[constant.DICTS_SEX]" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="状态" prop="lockFlag">
            <base-radio v-model="form.lockFlag" is-group :options="dicts[constant.DICTS_LOCK_FLAG]" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

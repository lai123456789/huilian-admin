<script>
import { getDept } from '@/api/admin/dept'
import { updateInfo } from '@/api/admin/auth'
import { url as fileUrl } from '@/api/admin/sys-file'
import { getDataDictionary } from '@/api/admin/dicts'
import { eachTree } from 'xe-utils'
import { getStorage } from '@/utils/storage'
import constant from '@/constant'
import { validPhone } from '@/utils/validate'
import encryption from '@/utils/aes'

export default {
  name: 'Profile',
  data() {
    this.depts = []
    const validatePass = (rule, value, callback) => {
      if (this.form.password !== '') {
        if (value !== this.form.newPassword) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      constant,
      form: {
        avatar: '',
        username: '',
        realname: '',
        sex: '0',
        phone: '',
        deptId: '',
        deptName: '',
        password: '',
        newPassword: '',
        newpassword2: ''
      },
      avatarUrl: '',
      dicts: {},
      rules: {
        phone: [{ validator: validPhone }],
        password: [{ required: true, min: 6, message: '原密码不少于6位' }],
        newPassword: [{ min: 6, message: '新密码不少于6位' }],
        newpassword2: [{ validator: validatePass }]
      }
    }
  },
  mounted() {
    this.getUser()
  },
  methods: {
    async getUser() {
      await this.$store.dispatch('user/getUserInfo')
      const dicts = await getDataDictionary([constant.DICTS_SEX])
      this.dicts = dicts
      const userInfo = getStorage({ name: constant.STORAGE_USER_INFO })
      const { avatar, username, phone, realname, sex, deptId } = userInfo
      let deptName = deptId

      // 如果没有的部门列表就从后台请求一次
      if (!this.depts.length) {
        const { data } = await getDept()
        this.depts = data
      }

      eachTree(this.depts, v => {
        if (v.id === deptId) {
          deptName = v.name
        }
      })

      this.form = {
        avatar,
        phone,
        sex,
        deptId,
        deptName,
        username,
        realname,
        password: void 0,
        newPassword: void 0,
        newpassword2: void 0
      }

      this.$nextTick(() => {
        this.$refs.formRef.clearValidate()
      })
      this.avatarUrl = `${window.origin}${this.form.avatar}`
    },
    handleAvatarSuccess(res) {
      this.form.avatar = `${fileUrl}/preView${res.data.url}`
      this.avatarUrl = `${window.origin}${this.form.avatar}`
    },
    handleSubmitForm() {
      this.$refs.formRef.validate((valid, invalidFields) => {
        if (valid) {
          const { password, newPassword, avatar, phone, sex, deptId, deptName, username, realname } = this.form
          const encryptPassword = encryption({
            data: { password },
            key: 'Ascp@10240000000',
            param: ['password']
          })
          const encryptNewPassword = encryption({
            data: { newPassword },
            key: 'Ascp@10240000000',
            param: ['newPassword']
          })

          updateInfo({
            password: encryptPassword.password,
            newPassword: encryptNewPassword.newPassword,
            avatar,
            phone,
            sex,
            deptId,
            deptName,
            username,
            realname
          }).then(async () => {
            this.$message.success('修改成功')
            // 修改后注销当前token,重新登录
            await this.$store.dispatch('user/logout')
            this.$router.push(`/login?redirect=${this.$route.fullPath}`)
          })
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
        }
      })
    },
    handleResetForm() {
      this.$refs.formRef.clearValidate()
      this.getUser()
    }
  }
}
</script>

<template>
  <div class="profile">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row>
        <base-col :span="12">
          <base-form-item label="头像">
            <base-upload class="avatar-uploader" :show-file-list="false" :on-success="handleAvatarSuccess">
              <el-image v-if="form.avatar" :src="avatarUrl" class="avatar">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline" style="font-size: 178px"></i>
                </div>
              </el-image>
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </base-upload>
          </base-form-item>
          <base-form-item label="用户名" prop="username">
            <base-input v-model="form.username" disabled />
          </base-form-item>
          <base-form-item label="部门" prop="deptName">
            <base-input v-model="form.deptName" disabled />
          </base-form-item>
          <base-form-item label="姓名" prop="realname">
            <base-input v-model="form.realname" auto-complete="off" />
          </base-form-item>
          <base-form-item label="性别" prop="sex">
            <base-radio v-model="form.sex" is-group :options="dicts[constant.DICTS_SEX]" />
          </base-form-item>
          <base-form-item label="手机号" prop="phone">
            <base-input v-model="form.phone" />
          </base-form-item>
          <base-form-item label="原密码" prop="password">
            <base-input v-model="form.password" type="password" autocomplete="new-password" />
          </base-form-item>
          <base-form-item label="新密码" prop="newPassword">
            <base-input v-model="form.newPassword" type="password" autocomplete="new-password" />
          </base-form-item>
          <base-form-item label="确认密码" prop="newpassword2">
            <base-input v-model="form.newpassword2" type="password" autocomplete="new-password" />
          </base-form-item>
          <base-form-item>
            <el-button type="primary" @click="handleSubmitForm()">提交</el-button>
            <el-button @click="handleResetForm()">重置</el-button>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </div>
</template>

<style lang="scss" scoped>
.profile {
  overflow: auto;
  padding: 20px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .avatar-uploader {
    .el-upload {
      position: relative;
      overflow: hidden;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      &:hover {
        border-color: #409eff;
      }
    }
  }
  .avatar-uploader-icon {
    width: 178px;
    height: 178px;
    font-size: 28px;
    border: 1px dashed #c0ccda;
    text-align: center;
    color: #8c939d;
    line-height: 178px;
  }
  .avatar {
    display: block;
    width: 178px;
    height: 178px;
  }
}
</style>

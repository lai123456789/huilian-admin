<!-- 邮件消息配置 -->
<script>
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { validatorNumRequired } from '@/utils/validate'

const form = {
  mailHost: '',
  mailPort: 25,
  mailFrom: '',
  mailUse: '',
  mailPass: '',
  mailStarttlsEnable: enums.WHETHER_BOOLEAN_STATUS.getFieldByKey('NO'),
  mailSslEnable: enums.WHETHER_BOOLEAN_STATUS.getFieldByKey('NO')
}

export default {
  name: 'SmsConfig',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    templateKey: String,
    title: String,
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
        mailHost: [{ required: true, message: '邮件服务器的SMTP地址必填', trigger: 'blur' }],
        mailPort: [{ required: true, message: '邮件服务器的SMTP端口必填', validator: validatorNumRequired, trigger: 'blur' }],
        mailFrom: [{ required: true, message: '发件人必填', trigger: 'blur' }],
        mailUser: [{ required: true, message: '用户名必填', trigger: 'blur' }],
        mailPass: [{ required: true, message: '密码必填', trigger: 'blur' }],
        mailStarttlsEnable: [{ required: true, message: '使用STARTTLS安全连接必填' }],
        mailSslEnable: [{ required: true, message: '使用SSL安全连接必填' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  mounted() {
    // 点进来立马的触发一下弹窗高度刷新
    this.$refs.dialogRef.handleResize()
    this.form = clone(form, true)
    Promise.all([getDataDictionary([]), publicValueSysPublicParamByPublicKey(this.templateKey)]).then(([dicts, info]) => {
      this.dicts = dicts
      Object.assign(this.form, info.data, {
        mailStarttlsEnable: String(info.data.mailStarttlsEnable),
        mailSslEnable: String(info.data.mailSslEnable)
      })
    })
  },
  methods: {
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const formData = clone(this.form, true)
          updatePublicValueSysPublicParam({ publicKey: this.templateKey, publicValue: JSON.stringify(formData) })
            .then(() => {
              this.$message.success('操作成功')
              this.visible = false
              done()
              // 刷新表格的时候，保存之前选中的数据
              this.reLoad(true)
            })
            .catch(() => {
              done()
            })
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
  <base-dialog ref="dialogRef" :visible.sync="visible" width="600px" :title="title" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="160px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="邮件服务器的SMTP地址" prop="mailHost">
            <base-input v-model="form.mailHost" placeholder="请输入邮件服务器的SMTP地址" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="邮件服务器的SMTP端口" prop="mailPort">
            <base-input-number v-model="form.mailPort" placeholder="请输入邮件服务器的SMTP端口" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="发件人" prop="mailFrom">
            <base-input v-model="form.mailFrom" placeholder="请输入发件人" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="用户名" prop="mailUser">
            <base-input v-model="form.mailUser" placeholder="请输入用户名" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="密码" prop="mailPass">
            <base-input v-model="form.mailPass" type="password" placeholder="请输入密码" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="使用STARTTLS安全连接" prop="mailStarttlsEnable">
            <base-radio v-model="form.mailStarttlsEnable" is-group :options="enums.WHETHER_BOOLEAN_STATUS.getList()"></base-radio>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="使用SSL安全连接" prop="mailSslEnable">
            <base-radio v-model="form.mailSslEnable" is-group :options="enums.WHETHER_BOOLEAN_STATUS.getList()"></base-radio>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

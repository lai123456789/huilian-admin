<!-- 短信消息配置 -->
<script>
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  chuanglanAccount: '',
  chuanglanPassword: '',
  aliyunAccessKeyId: '',
  aliyunAccessSecret: ''
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
        chuanglanAccount: [{ required: true, message: '创蓝SMS账号必填', trigger: 'blur' }],
        chuanglanPassword: [{ required: true, message: '创蓝SMS密码必填', trigger: 'blur' }],
        aliyunAccessKeyId: [{ required: true, message: '阿里云AccessKeyId必填', trigger: 'blur' }],
        aliyunAccessSecret: [{ required: true, message: '阿里云AccessSecret必填', trigger: 'blur' }]
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
      Object.assign(this.form, info.data)
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
  <base-dialog ref="dialogRef" :visible.sync="visible" width="500px" :title="title" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
      <el-divider>创蓝</el-divider>
      <base-row>
        <base-col :span="24">
          <base-form-item label="SMS账号" prop="chuanglanAccount">
            <base-input v-model="form.chuanglanAccount" placeholder="请输入SMS账号" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="SMS密码" prop="chuanglanPassword">
            <base-input v-model="form.chuanglanPassword" type="password" placeholder="请输入SMS密码" />
          </base-form-item>
        </base-col>
      </base-row>

      <el-divider>阿里云</el-divider>
      <base-row>
        <base-col :span="24">
          <base-form-item label="AccessKeyId" prop="aliyunAccessKeyId">
            <base-input v-model="form.aliyunAccessKeyId" placeholder="请输入AccessKeyId" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="AccessSecret" prop="aliyunAccessSecret">
            <base-input v-model="form.aliyunAccessSecret" type="password" placeholder="请输入AccessSecret" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

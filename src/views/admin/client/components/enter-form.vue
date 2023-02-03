<script>
import { getClientById, saveClient, updateClient } from '@/api/admin/client'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  clientId: '',
  clientSecret: '',
  scope: '',
  autoapprove: enums.WHETHER_BOOLEAN_STATUS.getFieldByKey('YES'),
  authorizedGrantTypes: [],
  accessTokenValidity: 0,
  refreshTokenValidity: 0,
  webServerRedirectUri: '',
  authorities: '',
  captchaFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
  encFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
  onlineQuantity: 0,
  additionalInformation: ''
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
        clientId: [{ required: true, message: '编号不能为空', trigger: 'blur' }],
        clientSecret: [{ required: true, message: '密钥不能为空', trigger: 'blur' }],
        scope: [{ required: true, message: '域不能为空', trigger: 'blur' }],
        autoapprove: [{ required: true, message: '自动放行不能为空', trigger: 'blur' }],
        authorizedGrantTypes: [{ required: true, message: '授权模式不能为空', trigger: 'blur' }]
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
        const { DICTS_WHETHER_STATUS, DICTS_GRANT_TYPES } = constant
        Promise.all([
          getDataDictionary([DICTS_WHETHER_STATUS, DICTS_GRANT_TYPES]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getClientById(this.tableRow.clientId)
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
            saveClient(this.form)
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
            updateClient(this.form)
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
    handleAdditiona() {
      this.form.additionalInformation = `{"enc_flag":"${this.form.captchaFlag}","captcha_flag":"${this.form.encFlag}", "online_quantity": "${this.form.onlineQuantity}"}`
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="12">
          <base-form-item label="编号" prop="clientId">
            <base-input v-model="form.clientId" placeholder="请输入编号" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="密钥" prop="clientSecret">
            <base-input v-model="form.clientSecret" placeholder="请输入密钥" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="域" prop="scope">
            <base-input v-model="form.scope" placeholder="请输入域" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="自动放行" prop="autoapprove">
            <base-radio v-model="form.autoapprove" is-group :options="enums.WHETHER_BOOLEAN_STATUS.getList()" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="授权模式" prop="authorizedGrantTypes">
            <base-checkbox v-model="form.authorizedGrantTypes" is-group :options="dicts[constant.DICTS_GRANT_TYPES]" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="令牌时效" prop="accessTokenValidity">
            <base-input-number v-model="form.accessTokenValidity" controls align="center" :min="0" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="刷新时效" prop="refreshTokenValidity">
            <base-input-number v-model="form.refreshTokenValidity" controls align="center" :min="0" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="回调地址" prop="webServerRedirectUri">
            <base-input v-model="form.webServerRedirectUri" placeholder="请输入回调地址" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="权限" prop="authorities">
            <base-input v-model="form.authorities" placeholder="请输入权限" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="验证码开关" prop="captchaFlag">
            <base-switch
              v-model="form.captchaFlag"
              :active-value="enums.WHETHER_STATUS.getFieldByKey('YES')"
              :inactive-value="enums.WHETHER_STATUS.getFieldByKey('NO')"
              @change="handleAdditiona"
            />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="前端密码加密" prop="encFlag">
            <base-radio v-model="form.encFlag" is-group :options="dicts[constant.DICTS_WHETHER_STATUS]" @change="handleAdditiona" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="同时在线数量" prop="onlineQuantity">
            <base-input-number v-model="form.onlineQuantity" controls align="center" :min="0" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

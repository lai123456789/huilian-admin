<script>
import { getClientById } from '@/api/admin/client'
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
    tableRow: {
      type: Object,
      default: () => ({})
    },
    transformAuthorizedGrantType: {
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
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_GRANT_TYPES } = constant
        Promise.all([getDataDictionary([DICTS_GRANT_TYPES]), getClientById(this.tableRow.clientId)]).then(([dicts, info]) => {
          this.dicts = dicts
          Object.assign(this.form, info.data)
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    getFormInstance() {
      return this.$refs.formRef
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="visible" custom-class="client-viwer-form-dialog" width="700px" title="查看" :show-footer="false">
    <base-form ref="formRef" :model="form" label-width="100px" size="mini">
      <base-row>
        <base-col :span="12">
          <base-form-item label="编号">
            <div class="viewr-item">{{ form.clientId }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="密钥">
            <div class="viewr-item">{{ form.clientSecret }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="域">
            <div class="viewr-item">{{ form.scope }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="自动放行">
            <div class="viewr-item">{{ enums.WHETHER_BOOLEAN_STATUS.getFieldByValue(form.autoapprove) }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="24" :offset="0">
          <base-form-item label="授权模式">
            <div class="viewr-item">
              {{ transformAuthorizedGrantType(form.authorizedGrantTypes, dicts[constant.DICTS_GRANT_TYPES]) }}
            </div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="令牌时效">
            <div class="viewr-item">{{ form.accessTokenValidity }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="刷新时效">
            <div class="viewr-item">{{ form.refreshTokenValidity }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="回调地址">
            <div class="viewr-item">{{ form.webServerRedirectUri }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="权限">
            <div class="viewr-item">{{ form.authorities }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="验证码开关">
            <div class="viewr-item">{{ form.captchaFlag === enums.WHETHER_STATUS.getFieldByKey('YES') ? '开' : '关' }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="前端密码加密">
            <div class="viewr-item">{{ enums.WHETHER_STATUS.getFieldByValue(form.encFlag) }}</div>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="同时在线数量" prop="onlineQuantity">
            <div class="viewr-item">{{ form.onlineQuantity }}</div>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.client-viwer-form-dialog {
  ::v-deep .el-form-item {
    .viewr-item {
      display: inline-block;
      vertical-align: middle;
    }
  }
}
</style>

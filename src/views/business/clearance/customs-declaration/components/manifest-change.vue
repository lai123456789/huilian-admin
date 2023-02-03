<script>
import { manifestChangeCustomsMaster, manifestDeleteCustomsMaster } from '@/api/customs/customs-master'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  changeContact: '',
  changePhone: '',
  changeReasonCode: '',
  changeReason: ''
}

export default {
  name: 'ManifestChange',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'change'
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
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
        changeContact: [{ required: true, message: '变更申请联系人姓名' }],
        changePhone: [{ required: true, message: '变更申请联系人电话' }],
        changeReasonCode: [{ required: true, message: '变更原因代码必填' }],
        changeReason: [{ required: true, message: '变更原因描述' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = Object.assign(clone(form, true), this.tableRow)
        const { DICTS_CHANGE_REASON_CODE } = constant
        Promise.all([getDataDictionary([DICTS_CHANGE_REASON_CODE])]).then(([dicts]) => {
          this.dicts = dicts
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
          if (this.type === 'change') {
            manifestChangeCustomsMaster(this.form)
              .then(() => {
                this.$message.success('变更成功')
                this.visible = false
                done()
                this.reLoad()
              })
              .catch(() => {
                done()
              })
          } else {
            manifestDeleteCustomsMaster(this.form)
              .then(() => {
                this.$message.success('删除成功')
                this.visible = false
                done()
                this.reLoad()
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
  <base-dialog :visible.sync="visible" width="600px" :title="title" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="140px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="变更申请联系人姓名" prop="changeContact">
            <base-input v-model="form.changeContact" placeholder="请输入变更申请联系人姓名" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="变更申请联系人电话" prop="changePhone">
            <base-input v-model="form.changePhone" placeholder="请输入变更申请联系人电话" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="变更原因代码" prop="changeReasonCode">
            <base-select
              v-model="form.changeReasonCode"
              placeholder="请选择变更原因代码"
              :options="dicts[constant.DICTS_CHANGE_REASON_CODE]"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="变更原因描述" prop="changeReason">
            <base-input v-model="form.changeReason" type="textarea" placeholder="请输入变更原因描述" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

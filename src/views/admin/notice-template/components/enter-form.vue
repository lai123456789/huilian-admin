<script>
import { getSysNoticeTemplateById, saveSysNoticeTemplate, updateSysNoticeTemplate } from '@/api/admin/notice-template'
import { getDataDictionary } from '@/api/admin/dicts'
import { getUser } from '@/api/admin/user'
import { clone } from 'xe-utils'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  templateName: '',
  templateType: enums.NOTICE_TEMPALTE_TYPE.getFieldByKey('NOTE'),
  status: enums.ENABLE_DISABLE.getFieldByKey('ENABLED'),
  sender: '',
  content: '',
  datasource: '',
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
        templateName: [{ required: true, message: '模板名称必填', trigger: 'blur' }],
        content: [{ required: true, message: '格式内容必填', trigger: 'blur' }]
      },
      dicts: {},
      userOptions: []
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_NOTICE_TEMPLATE_TYPE, DICTS_ENABLE_DISABLE } = constant
        Promise.all([
          getDataDictionary([DICTS_NOTICE_TEMPLATE_TYPE, DICTS_ENABLE_DISABLE]),
          getUser({ size: -1 }),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getSysNoticeTemplateById(this.tableRow.id)
        ]).then(([dicts, users, info]) => {
          this.dicts = dicts
          this.userOptions = users.data.records.map(v => ({ label: v.realname, value: v.userId }))
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              sender: info.data.sender.split(',')
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
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveSysNoticeTemplate(transforArrayPayload(this.form))
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
            updateSysNoticeTemplate(transforArrayPayload(this.form))
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="模板名称" prop="templateName">
            <base-input v-model="form.templateName" placeholder="请输入模板名称" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="模板类型" prop="templateType">
            <base-select v-model="form.templateType" :clearable="false" :options="dicts[constant.DICTS_NOTICE_TEMPLATE_TYPE]" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="状态" prop="status">
            <base-radio v-model="form.status" is-group :options="dicts[constant.DICTS_ENABLE_DISABLE]" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="发送人" prop="sender">
            <base-select v-model="form.sender" class="role-select" multiple placeholder="请选择发送人" :options="userOptions" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="格式内容" prop="content">
            <base-input v-model="form.content" type="textarea" :rows="1" placeholder="请输入格式内容" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="数据源" prop="datasource">
            <base-input v-model="form.datasource" type="textarea" :rows="8" placeholder="请输入数据源" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" :rows="1" placeholder="请输入备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

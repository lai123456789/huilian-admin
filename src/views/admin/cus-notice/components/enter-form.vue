<script>
import { getSysCusNoticeById, saveSysCusNotice, updateSysCusNotice } from '@/api/admin/sys-cus-notice'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BaseQuillEditor from '@/components/base/quill-editor'

const form = {
  noticeType: '0',
  noticePopup: '0',
  noticeTime: '',
  noticeTitle: '',
  noticeContent: ''
}

export default {
  name: 'EnterForm',
  components: { BaseQuillEditor },
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
        noticeTime: [{ required: true, message: '生效时间必填', trigger: 'blur' }],
        noticeTitle: [{ required: true, message: '公告标题必填', trigger: 'blur' }],
        noticeContent: [{ required: true, message: '公告内容必填', trigger: 'blur' }]
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
        const { DICTS_WHETHER_STATUS, DICTS_NOTICE_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_WHETHER_STATUS, DICTS_NOTICE_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getSysCusNoticeById(this.tableRow.id)
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
            saveSysCusNotice(this.form)
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
            updateSysCusNotice(this.form)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="消息类型" prop="noticeType">
            <base-select v-model="form.noticeType" :options="dicts[constant.DICTS_NOTICE_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="是否弹出" prop="noticePopup">
            <base-select v-model="form.noticePopup" :options="dicts[constant.DICTS_WHETHER_STATUS]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="生效时间" prop="noticeTime">
            <base-date-picker
              v-model="form.noticeTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择生效时间"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="公告标题" prop="noticeTitle">
            <base-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item class="quill-editor-item" label="公告内容" prop="noticeContent">
            <base-quill-editor v-model="form.noticeContent" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<style lang="scss" scoped>
.quill-editor-item {
  align-items: flex-start !important;
  ::v-deep .el-form-item__label {
    padding-top: 20px !important;
  }
}
</style>

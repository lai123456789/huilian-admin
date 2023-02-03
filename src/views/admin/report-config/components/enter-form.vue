<script>
import { getSysReportConfigById, saveSysReportConfig, updateSysReportConfig } from '@/api/admin/sys-report-config'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import vueJsonEditor from 'vue-json-editor'

const form = {
  menuMark: '',
  exportType: '',
  reportType: '',
  exportFileName: '',
  sourceFileName: '',
  reqParam: '',
  metadata: {},
  remark: ''
}

export default {
  name: 'EnterForm',
  components: { vueJsonEditor },
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
        menuMark: [{ required: true, message: '菜单标识不能为空' }],
        exportType: [{ required: true, message: '设计器类型不能为空' }],
        reportType: [{ required: true, message: '报表类型不能为空' }],
        exportFileName: [{ required: true, message: '请导出文件名不能为空' }],
        sourceFileName: [{ required: true, message: '源文件名不能为空' }],
        reqParam: [{ required: true, message: '请求参数不能为空' }]
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
        const { DICTS_EXPORT_TYPE, DICTS_REPORT_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_EXPORT_TYPE, DICTS_REPORT_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getSysReportConfigById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              metadata: info.data.metadata ? JSON.parse(info.data.metadata) : ''
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
          const formData = Object.assign(clone(this.form, true), {
            metadata: this.form.metadata ? JSON.stringify(this.form.metadata) : ''
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveSysReportConfig(formData)
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
            updateSysReportConfig(formData)
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
    width="800px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row :gutter="10">
        <base-col :span="12">
          <base-form-item label="菜单标识" prop="menuMark">
            <base-input v-model="form.menuMark" placeholder="请输入菜单标识" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="设计器类型" prop="exportType">
            <base-select v-model="form.exportType" placeholder="请选择设计器类型" :options="dicts[constant.DICTS_EXPORT_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="报表类型" prop="reportType">
            <base-select v-model="form.reportType" placeholder="请选择报表类型" :options="dicts[constant.DICTS_REPORT_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="导出文件名" prop="exportFileName">
            <base-input v-model="form.exportFileName" placeholder="请输入导出文件名" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="源文件名" prop="sourceFileName">
            <base-input v-model="form.sourceFileName" placeholder="请输入源文件名" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="请求参数" prop="reqParam">
            <base-input v-model="form.reqParam" placeholder="请输入请求参数" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item prop="metadata">
            <vue-json-editor v-model="form.metadata" class="report-config-json-editor" :show-btns="false" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.report-config-json-editor {
  .jsoneditor-vue {
    height: 300px;
    .jsoneditor-contextmenu {
      .jsoneditor-icon {
        position: relative;
      }
    }
  }
}
</style>

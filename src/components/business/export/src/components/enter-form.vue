<script>
import { mergeReportExcelSysReportConfig } from '@/api/admin/sys-report-config'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import { fileDownload } from '@/utils'

const form = {
  fileName: ''
}

export default {
  name: 'EnterForm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRows: {
      type: Array,
      default: () => []
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
        name: [{ required: true, message: '文件名必填', trigger: 'blur' }]
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
        Promise.all([getDataDictionary([])]).then(([dicts]) => {
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
          mergeReportExcelSysReportConfig({
            fileName: this.form.fileName,
            params: JSON.stringify(this.tableRows)
          })
            .then(blob => {
              fileDownload('', {}, `${this.form.fileName}.xlsx`, false, blob)
              this.visible = false
              this.$message.success('操作成功')
              done()
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
  <base-dialog :visible.sync="visible" width="500px" title="录入文件名" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="70px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="文件名" prop="fileName">
            <base-input v-model="form.fileName" placeholder="请输入文件名" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

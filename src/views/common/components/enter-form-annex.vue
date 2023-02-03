<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  fileType: '',
  remark: ''
}

export default {
  name: 'EnterFormAnnex',

  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    fileModule: String,
    recordKey: {
      type: String,
      default: 'id'
    },
    tableRow: Object,
    mainRow: Object,
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    options: {
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
      rules: {},
      dicts: {},
      fileList: []
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = Object.assign(clone(form, true), {
          fileModule: this.fileModule,
          recordId: this.tableRow[this.recordKey]
        })
        this.fileList = []
        const { DICTS_FILE_MODULE } = constant
        Promise.all([getDataDictionary([DICTS_FILE_MODULE])]).then(([dicts]) => {
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
    handleFileChange(file) {
      this.fileList.push(file)
    },
    handleFileRemove(file) {
      this.fileList.splice(this.fileList.indexOf(file.uid), 1)
      this.$nextTick(() => {
        this.$refs.uploadRef.uploadOnlyOneFileShow()
      })
    },
    handleFileSuccess(response) {
      if (response.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        this.$message.success('上传成功')
        this.reLoad(false)
        this.visible = false
        this.saveDone()
      } else {
        this.$message.error(response.msg)
        this.saveDone()
      }
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.$refs.uploadRef.submit()
          this.saveDone = done
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="附件类型" prop="fileType">
            <base-select v-model="form.fileType" placeholder="请选择附件类型" filterable :options="dicts[constant.DICTS_FILE_MODULE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="附件" prop="fileList">
            <base-upload
              ref="uploadRef"
              :file-list="fileList"
              drag
              multiple
              class="upload-dragger"
              :data="form"
              :auto-upload="false"
              :is-before-remove="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :on-success="handleFileSuccess"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </base-upload>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.upload-dragger {
  width: 100%;
  .el-upload {
    width: 100%;
    .el-upload-dragger {
      width: 100%;
    }
  }
  .el-upload-list__item:first-child {
    margin-top: 5px;
  }
}
</style>

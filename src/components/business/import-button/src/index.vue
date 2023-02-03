<script>
import { fileDownload } from '@/utils'

export default {
  name: 'BusinessImportButton',
  props: {
    title: {
      type: String,
      default: '导入'
    },
    action: String,
    uploadData: {
      type: Object,
      default: () => ({})
    },
    downloadConfig: Object
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    // 下载模板
    handleDownload() {
      const { url, params, fileName } = this.downloadConfig
      fileDownload(url, params, fileName)
    },
    onSuccess(response, file, fileList) {
      this.$emit(
        'result',
        response,
        'success',
        () => {
          this.visible = false
        },
        file,
        fileList
      )
    },
    onError(error, file, fileList) {
      this.$emit(
        'result',
        error,
        'error',
        () => {
          this.visible = false
        },
        file,
        fileList
      )
    }
  }
}
</script>

<template>
  <div class="business-import-button">
    <el-button size="mini" type="primary" @click="open">
      <slot>导入</slot>
    </el-button>

    <base-dialog :visible.sync="visible" width="500px" title="导入" :show-save="false">
      <slot
        name="dialog-content"
        :upload="{
          action,
          onSuccess,
          onError
        }"
      >
        <base-form ref="formRef" :model="{}" label-width="80px" size="mini">
          <base-row>
            <base-col :span="24">
              <base-form-item label="模板" prop="template">
                <el-button size="mini" type="primary" @click="handleDownload">下载</el-button>
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="文件上传" prop="uolpad">
                <base-upload
                  :action="action"
                  :data="uploadData"
                  :show-file-list="false"
                  :on-success="onSuccess"
                  :on-error="onError"
                  button-text="导入"
                ></base-upload>
              </base-form-item>
            </base-col>
          </base-row>
        </base-form>
      </slot>
    </base-dialog>
  </div>
</template>

<style lang="scss">
.business-import-button {
  display: inline-block;
  & + .el-button {
    margin-left: 10px;
  }
}
.el-button {
  & + .business-import-button {
    margin-left: 10px;
  }
}
</style>

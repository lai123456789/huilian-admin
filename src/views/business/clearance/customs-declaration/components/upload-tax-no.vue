<script>
import { uploadTaxFormCustomsMaster } from '@/api/customs/customs-master'
import { getDataDictionary } from '@/api/admin/dicts'
import { filePrevie } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'

export default {
  name: 'UploadTaxNo',
  props: {
    value: {
      type: Boolean,
      default: false
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
      dicts: {},
      fileList: []
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.fileList = []
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  mounted() {
    Promise.all([getDataDictionary([])]).then(([dicts]) => {
      this.dicts = dicts
    })
  },
  methods: {
    handleFilePreview(file) {
      filePrevie({ fileName: file.name, path: file.response ? file.response.data.url : file.url })
    },
    uploadSuccess(response) {
      if (response.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        this.fileList.push({ id: response.data.id })
      }
    },
    handleSave(done) {
      if (!this.fileList.length) return this.$message.error('请上传附件')
      uploadTaxFormCustomsMaster({ customsId: this.tableRow.id, fileIds: this.fileList.map(v => v.id) })
        .then(() => {
          this.$message.success('操作成功')
          this.visible = false
          done()
          this.reLoad()
        })
        .catch(() => {
          done()
        })
    },
    getFormInstance() {
      return this.$refs.formRef
    }
  }
}
</script>

<template>
  <base-dialog ref="dialogRef" :visible.sync="visible" width="500px" title="上传税单" @save="handleSave">
    <base-form ref="formRef" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="税单附件">
            <base-upload
              multiple
              :on-preview="handleFilePreview"
              :data="{
                fileModule: constant.FILE_MODULE_CUS_DECLAR,
                recordId: tableRow.id,
                // TODO 税单附件
                fileType: '普通附件'
              }"
              :on-success="uploadSuccess"
            ></base-upload>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<script>
import { uploadUrl, delSysFile } from '@/api/admin/sys-file'
import { compress } from 'image-conversion'
import { getStorage } from '@/utils/storage'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import constant from '@/constant'
import config from '@/config'

export default {
  name: 'BaseUpload',
  props: {
    action: String,
    /** 按钮文本 */
    buttonText: {
      type: String,
      default: '上传'
    },
    /** 图片是否压缩 */
    isCompress: {
      type: Boolean,
      default: true
    },
    isUploadOnlyOneFile: {
      type: Boolean,
      default: false
    },
    fileList: {
      type: Array,
      default: () => []
    },
    limit: Number,
    drag: {
      type: Boolean,
      default: false
    },
    headers: {
      type: Object,
      default: () => ({})
    },
    beforeUpload: Function,
    beforeRemove: Function,
    onChange: {
      type: Function,
      default: () => () => {}
    },
    isBeforeRemove: {
      type: Boolean,
      default: true
    },
    /** 是否移除文件时提示确认 */
    isRemoveHint: {
      type: Boolean,
      default: true
    },
    showFileList: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      files: this.fileList,
      showTriggerBtn: true,
      hintMark: true
    }
  },
  computed: {
    enhanceAction() {
      return this.action ? this.action : `${window.origin}${uploadUrl}`
    },
    enhanceLimit() {
      return this.isUploadOnlyOneFile ? 1 : this.limit
    },
    enhanceHeaders() {
      const OTHER = {}
      if (process.env.NODE_ENV === 'development') {
        Object.assign(OTHER, config.apiHeaders)
      }
      return Object.assign(
        {
          Authorization: `Bearer ${getStorage({ name: constant.STORAGE_ACCESS_TOKEN })}`
        },
        OTHER,
        this.headers
      )
    }
  },
  watch: {
    fileList: {
      handler(newValue) {
        this.uploadOnlyOneFile()
        this.files = newValue
      },
      deep: true
    }
  },
  mounted() {
    this.uploadOnlyOneFile()
  },
  methods: {
    uploadOnlyOneFile() {
      if (this.isUploadOnlyOneFile && this.files.length > 0) {
        if (this.$refs.uploadRef) {
          const target = this.$refs.uploadRef.$el.querySelector('.el-upload.el-upload--text')
          target.style.display = 'none'
          this.showTriggerBtn = false
        }
      }
    },
    uploadOnlyOneFileShow() {
      if (this.isUploadOnlyOneFile) {
        if (this.$refs.uploadRef) {
          const target = this.$refs.uploadRef.$el.querySelector('.el-upload.el-upload--text')
          target.style.display = 'inline-block'
          this.showTriggerBtn = true
        }
      }
    },
    handleChange(file, fileList) {
      this.files = fileList
      this.uploadOnlyOneFile()
      this.onChange(file, fileList)
    },
    // before-remove 和 before-upload 同时使用，如果 before-upload 返回reject或者false，会自动执行 before-remove
    handleBeforeUpload(file) {
      if (this.isCompress) {
        return new Promise((resolve, reject) => {
          publicValueSysPublicParamByPublicKey(constant.PARAMS_COMPRESS)
            .then(defaultConfigRes => {
              const size = defaultConfigRes.data ? defaultConfigRes.data.value * 1024 : config.fileCompress.size * 1024
              if (['jpg', 'JPG', 'jpeg', 'JPEG'].includes(file.type.split('/')[1]) && size <= file.size) {
                // 图片压缩
                compress(file, {
                  quality: defaultConfigRes.data ? defaultConfigRes.data.quality : config.fileCompress.quality,
                  type: file.type
                }).then(res => {
                  const before = this.beforeUpload && this.beforeUpload(file, res)
                  if (before && before.then) {
                    before.then(
                      () => {
                        this.hintMark = true
                        resolve()
                      },
                      () => {
                        this.hintMark = false
                        reject()
                      }
                    )
                  } else if (before === true) {
                    this.hintMark = true
                    resolve()
                  } else if (before === false) {
                    this.hintMark = false
                    reject()
                  } else {
                    this.hintMark = true
                    resolve()
                  }
                })
              } else {
                const before = this.beforeUpload && this.beforeUpload(file)
                if (before && before.then) {
                  before.then(
                    () => {
                      this.hintMark = true
                      resolve()
                    },
                    () => {
                      this.hintMark = false
                      reject()
                    }
                  )
                } else if (before === true) {
                  this.hintMark = true
                  resolve()
                } else if (before === false) {
                  this.hintMark = false
                  reject()
                } else {
                  this.hintMark = true
                  resolve()
                }
              }
            })
            .catch(error => {
              this.hintMark = false
              reject(error)
            })
        })
      } else {
        return this.beforeUpload(file)
      }
    },
    handleBeforeRemove(file, fileList) {
      if (!this.isBeforeRemove) {
        return true
      }

      if (this.isRemoveHint && this.hintMark) {
        return new Promise((resolve, reject) => {
          this.$confirm(`确定移除 ${file.name}?`)
            .then(() => {
              const { response, id } = file
              const eid = response ? response.data.id : id
              delSysFile({ ids: [eid] })
                .then(() => {
                  this.uploadOnlyOneFileShow()
                  if (this.beforeRemove) {
                    const before = this.beforeRemove(file, fileList)
                    if (before && before.then) {
                      before.then(
                        () => {
                          resolve()
                        },
                        () => {
                          reject()
                        }
                      )
                    }
                  } else {
                    resolve()
                  }
                })
                .catch(() => {
                  reject()
                })
            })
            .catch(() => {
              reject()
            })
        })
      } else {
        if (this.beforeRemove) {
          return this.beforeRemove(file, fileList, this.uploadOnlyOneFileShow())
        } else {
          this.uploadOnlyOneFileShow()()
          return true
        }
      }
    },
    clearFiles() {
      this.getInstance().clearFiles()
    },
    abort(file) {
      this.getInstance().abort(file)
    },
    submit() {
      this.getInstance().submit()
    },
    getInstance() {
      return this.$refs.uploadRef
    }
  }
}
</script>

<template>
  <div class="base-upload">
    <el-upload
      ref="uploadRef"
      :action="enhanceAction"
      :limit="enhanceLimit"
      :headers="enhanceHeaders"
      :show-file-list="showFileList"
      :file-list="files"
      :on-change="handleChange"
      :drag="drag"
      :before-remove="handleBeforeRemove"
      :before-upload="handleBeforeUpload"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <slot>
        <el-button v-if="!drag && showTriggerBtn" size="mini" type="primary">{{ buttonText }}</el-button>
      </slot>
      <slot name="trigger" />
      <slot name="tip" />
      <template #file="{ file }">
        <slot name="file" :file="file" />
      </template>
    </el-upload>
  </div>
</template>

<style lang="scss">
.base-upload {
  display: inline-block;
  .el-upload-list__item {
    display: grid;
    margin-top: 0 !important;
    margin-bottom: 5px;
    transition: none !important;
    &:last-child {
      margin-bottom: 0;
    }
    .el-icon-close-tip {
      display: none;
    }
  }
}
</style>

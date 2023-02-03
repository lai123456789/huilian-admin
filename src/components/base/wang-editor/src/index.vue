<script>
import { url as fileUrl, uploadSysFile } from '@/api/admin/sys-file'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { compress } from 'image-conversion'
import config from '@/config'
import constant from '@/constant'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'

export default {
  name: 'BaseWangEditor',
  components: { Editor, Toolbar },
  props: {
    isCompress: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const that = this
    return {
      editor: null,
      toolbarConfig: {
        excludeKeys: ['bgColor', 'fullScreen', 'bulletedList', 'numberedList', 'todo', 'group-video']
      },
      editorConfig: {
        placeholder: '请输入内容...',
        MENU_CONF: {
          uploadImage: {
            allowedFileTypes: ['image/*'],
            async customUpload(file, insertFn) {
              const defaultConfigRes = await publicValueSysPublicParamByPublicKey(constant.PARAMS_COMPRESS)
              let compressFile = file
              const size = defaultConfigRes.data ? defaultConfigRes.data.value * 1024 : config.fileCompress.size * 1024
              if (['jpg', 'JPG', 'jpeg', 'JPEG'].includes(file.type.split('/')[1]) && that.isCompress && size <= file.size) {
                const res = await compress(file, {
                  quality: defaultConfigRes.data ? defaultConfigRes.data.quality : config.fileCompress.quality,
                  type: file.type
                })
                compressFile = res
              }
              const res = await uploadSysFile({ file: compressFile })
              insertFn(`${window.origin}${fileUrl}/preView${res.data.url}`)
            }
          }
        }
      },
      mode: 'default' // or 'simple'
    }
  },
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    // 组件销毁时，及时销毁编辑器
    editor.destroy()
  },
  methods: {
    createInstance(editor) {
      // 一定要用 Object.seal() ，否则会报错
      this.editor = Object.seal(editor)
      this.$nextTick(() => {
        this.$emit('createInstance', this.editor)
      })
    }
  }
}
</script>

<template>
  <div class="base-wang-editor">
    <toolbar class="base-wang-editor-toolabr" :editor="editor" :default-config="toolbarConfig" :mode="mode" />
    <editor class="base-wang-editor-editor" :default-config="editorConfig" :mode="mode" @onCreated="createInstance" />
  </div>
</template>

<style src="@wangeditor/editor/dist/css/style.css"></style>
<style lang="scss" scoped>
.base-wang-editor {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  &-toolabr {
    border-bottom: 1px solid #cccccc;
  }
  &-editor {
    overflow-y: hidden;
    height: 0;
    flex: 1;
    ::v-deep .w-e-scroll {
      > div[contenteditable='false'] {
        background-color: #f5f7fa;
      }
    }
  }
  ::v-deep .w-e-modal {
    top: 10px !important;
    right: auto !important;
    bottom: auto !important;
    left: 50% !important;
    transform: translateX(-50%);
  }
  ::v-deep a {
    text-decoration: underline;
    color: #0000ee;
    cursor: pointer;
  }
}
</style>

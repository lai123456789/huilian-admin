<script>
import { url as fileUrl } from '@/api/admin/sys-file'
import emitter from 'element-ui/lib/mixins/emitter'
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
  name: 'BaseQuillEditor',
  components: {
    quillEditor
  },
  mixins: [emitter],
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: String
    }
  },
  data() {
    this.accepts = ['.jpeg', '.png', '.jpg', '.svg', '.tiff', '.gif', '.raw', '.eps', '.pdf']
    return {
      uid: this._uid,
      content: this.value,
      option: {
        modules: {
          toolbar: {
            container: [['bold', 'italic', 'underline', 'link', 'image']],
            handlers: {
              image: value => {
                if (value) {
                  document.querySelector(`#quill-editor-uploader-${this.uid} input`).click()
                } else {
                  this.quill.format('image', false)
                }
              }
            }
          }
        }
      }
    }
  },
  computed: {
    accept() {
      return this.accepts.join(',')
    }
  },
  watch: {
    value(val) {
      this.content = val
      this.dispatch('ElFormItem', 'el.form.change', [val])
    }
  },
  methods: {
    handleInput(val) {
      this.$emit('input', val)
    },
    handleChange(ev) {
      this.$emit('change', ev)
    },
    handleBlur() {
      this.dispatch('ElFormItem', 'el.form.blur', [this.content])
    },
    handleQuillEditorImgSuccess(file) {
      if (file.code === 0) {
        const quill = this.$refs.quillEditorRef.quill
        const length = quill.getSelection().index
        const imgSrc = `${window.location.origin}${fileUrl}/preView${file.data.url}`
        quill.insertEmbed(length, 'image', imgSrc)
        // 调整光标到最后
        quill.setSelection(length + 1)
      }
    }
  }
}
</script>

<template>
  <div class="base-quill-editor">
    <quill-editor ref="quillEditorRef" :value="content" :options="option" @input="handleInput" @change="handleChange" @blur="handleBlur" />
    <base-upload
      :id="`quill-editor-uploader-${uid}`"
      style="display: none"
      :limit="20"
      :multiple="true"
      :accept="accept"
      :show-file-list="false"
      :on-success="handleQuillEditorImgSuccess"
    >
    </base-upload>
  </div>
</template>

<style lang="scss">
.base-quill-editor {
  height: 250px;
  .quill-editor {
    height: 100%;
    .ql-snow {
      .ql-tooltip {
        z-index: 1;
      }
    }
  }
}
</style>

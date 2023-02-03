<!-- 在线系统参数配置 -->
<script>
import { url as fileUrl } from '@/api/admin/sys-file'
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  url: '',
  title: ''
}

export default {
  name: 'OnlineSystemParam',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    templateKey: String,
    title: String,
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
      rules: {},
      dicts: {},
      logoUrl: ''
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  mounted() {
    // 点进来立马的触发一下弹窗高度刷新
    this.$refs.dialogRef.handleResize()
    this.form = clone(form, true)
    Promise.all([getDataDictionary([]), publicValueSysPublicParamByPublicKey(this.templateKey)]).then(([dicts, info]) => {
      this.dicts = dicts
      Object.assign(this.form, info.data)
      this.logoUrl = `${window.location.origin}${fileUrl}/preView${this.form.url}`
    })
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.logoUrl = URL.createObjectURL(file.raw)
      this.form.url = res.data.url
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          updatePublicValueSysPublicParam({ publicKey: this.templateKey, publicValue: JSON.stringify(this.form) })
            .then(() => {
              this.$message.success('操作成功')
              this.visible = false
              done()
              // 刷新表格的时候，保存之前选中的数据
              this.reLoad(true)
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
  <base-dialog ref="dialogRef" :visible.sync="visible" width="500px" :title="title" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="系统logo" prop="url">
            <base-upload class="logo" :show-file-list="false" :on-success="handleAvatarSuccess">
              <img v-if="form.url" id="avatar" :src="logoUrl" class="logo-img" />
              <i v-else class="el-icon-plus logo-uploader-icon"></i>
            </base-upload>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="系统标题" prop="title">
            <base-input v-model="form.title" placeholder="请输入系统标题" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<style lang="scss" scoped>
.logo {
  ::v-deep .el-upload {
    position: relative;
    overflow: hidden;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    &:hover {
      border-color: #409eff;
    }
  }
}
.logo-uploader-icon {
  width: 120px;
  height: 120px;
  font-size: 28px;
  text-align: center;
  color: #8c939d;
  line-height: 120px;
}
.logo-img {
  display: block;
  width: 120px;
  height: 120px;
}
</style>

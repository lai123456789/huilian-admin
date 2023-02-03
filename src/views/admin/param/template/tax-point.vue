<!-- 默认税点配置 -->
<script>
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  vatPoint: '0.13',
  servicePoint: '0.06'
}

export default {
  name: 'TaxPoint',
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
      dicts: {}
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
    const { DICTS_TAX_RATE } = constant
    Promise.all([getDataDictionary([DICTS_TAX_RATE]), publicValueSysPublicParamByPublicKey(this.templateKey)]).then(([dicts, info]) => {
      this.dicts = dicts
      const { vatPoint, servicePoint } = info.data
      Object.assign(this.form, {
        vatPoint: String(vatPoint),
        servicePoint: String(servicePoint)
      })
    })
  },
  methods: {
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
          <base-form-item label="增值税点" prop="vatPoint">
            <base-select v-model="form.vatPoint" placeholder="请输入增值税点" :options="dicts[constant.DICTS_TAX_RATE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="服务税点" prop="servicePoint">
            <base-select v-model="form.servicePoint" placeholder="请输入服务税点" :options="dicts[constant.DICTS_TAX_RATE]" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

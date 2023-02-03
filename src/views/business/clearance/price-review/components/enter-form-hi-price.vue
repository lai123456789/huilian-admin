<script>
import { reviewHiPriceOrderImportHiPrice } from '@/api/order/order-import-hi-pirce'
import { reviewHiPriceOrderExportHiPrice } from '@/api/order/order-export-hi-pirce'
import { clone } from 'xe-utils'
import enums from '@/enums'

const form = {
  hiPriceRemark: ''
}

export default {
  name: 'EnterFormHiPrice',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    title: String,
    orderType: String,
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      enums,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        hiPriceRemark: [{ required: true, message: '审价备注必填', trigger: 'blur' }]
      }
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = Object.assign(clone(form, true), this.tableRow)
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
          if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
            reviewHiPriceOrderImportHiPrice(this.form)
              .then(() => {
                this.$message.success('操作成功')
                this.visible = false
                done()
                this.reLoad(false)
              })
              .catch(() => {
                done()
              })
          } else {
            reviewHiPriceOrderExportHiPrice(this.form)
              .then(() => {
                this.$message.success('操作成功')
                this.visible = false
                done()
                this.reLoad(false)
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
  <base-dialog :visible.sync="visible" width="500px" :title="title" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="审价备注" prop="hiPriceRemark">
            <base-input v-model="form.hiPriceRemark" type="textarea" placeholder="请输入审价备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

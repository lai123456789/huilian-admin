<script>
import { updateFunctionCallAcctReceiveInvoice } from '@/api/finance/acct-receive-invoice'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  functionCallStatus: '',
  sendLetterDate: '',
  replyDate: '',
  remark: ''
}

export default {
  name: 'EnterFormCorresp',
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
      form: clone(form, true),
      rules: {
        functionCallStatus: [{ required: true, message: '函调状态必填' }],
        sendLetterDate: [{ required: true, message: '发函日期必填' }],
        replyDate: [{ required: true, message: '回函日期必填' }],
        remark: [{ required: true, message: '备注必填' }]
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
        const { DICTS_FUNCTION_CALL_STATUS } = constant
        Promise.all([getDataDictionary([DICTS_FUNCTION_CALL_STATUS])]).then(([dicts]) => {
          this.dicts = dicts
          Object.assign(this.form, this.tableRow)
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
          updateFunctionCallAcctReceiveInvoice(this.form)
            .then(() => {
              this.$message.success('操作成功')
              this.reLoad()
              this.visible = false
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
  <base-dialog :visible.sync="visible" width="500px" title="函调状态变更" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="函调状态" prop="functionCallStatus">
            <base-select
              v-model="form.functionCallStatus"
              placeholder="请选择函调状态"
              :options="dicts[constant.DICTS_FUNCTION_CALL_STATUS]"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="发函日期" prop="sendLetterDate">
            <base-date-picker v-model="form.sendLetterDate" type="date" placeholder="选择发函日期" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="回函日期" prop="replyDate">
            <base-date-picker v-model="form.replyDate" type="date" placeholder="选择回函日期" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" placeholder="请输入备注" type="textarea" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

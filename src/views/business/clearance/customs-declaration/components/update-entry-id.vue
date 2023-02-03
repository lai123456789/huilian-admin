<script>
import { updateEntryIdCustomsMaster } from '@/api/customs/customs-master'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  entryId: '',
  declareDate: '',
  billNo: ''
}

export default {
  name: 'UpdateEntryId',
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
      rules: {},
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = Object.assign({ customsId: this.tableRow.id }, clone(form, true), this.tableRow)
        Promise.all([getDataDictionary([])]).then(([dicts]) => {
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
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          updateEntryIdCustomsMaster(this.form)
            .then(() => {
              this.$message.success('操作成功')
              this.visible = false
              done()
              this.reLoad()
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
  <base-dialog :visible.sync="visible" width="500px" title="报关信息补录 " @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="海关编号" prop="entryId">
            <base-input v-model="form.entryId" placeholder="请输入海关编号" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="申报日期" prop="declareDate">
            <base-date-picker v-model="form.declareDate" type="date" placeholder="请选择申报日期" />
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="提运单号" prop="billNo">
            <base-input v-model="form.billNo" placeholder="请输入提运单号" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

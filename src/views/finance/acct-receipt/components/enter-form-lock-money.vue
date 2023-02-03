<script>
import { updateLockMoneyAcctReceipt } from '@/api/finance/acct-receipt'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  lockMoney: 0,
  lockRemark: ''
}

export default {
  name: 'EnterFormLockMoney',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    reLoad: Function
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
        lockMoney: [{ required: true, message: '锁定金额必填' }]
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
        Promise.all([getDataDictionary([])]).then(([dicts]) => {
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
          updateLockMoneyAcctReceipt(this.form)
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
  <base-dialog :visible.sync="visible" width="500px" title="修改锁定金额" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="锁定金额" prop="lockMoney">
            <base-input-number v-model="form.lockMoney" :precision="2" placeholder="请输入锁定金额" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="锁定备注" prop="lockRemark">
            <base-input v-model="form.lockRemark" type="textarea" placeholder="请输入锁定备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<script>
import { syncCustomsRateBaseCustomsRate } from '@/api/base/base-customs-rate'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'

const form = {
  date: ''
}

export default {
  name: 'SyncEnterForm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        date: [{ required: true, message: '日期必填', trigger: 'blur' }]
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
          syncCustomsRateBaseCustomsRate(this.form)
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
  <base-dialog :visible.sync="visible" width="500px" title="同步海关汇率" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="70px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="日期" prop="date">
            <base-date-picker v-model="form.date" type="month" format="yyyy-MM" value-format="yyyy-MM" placeholder="选择日期" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

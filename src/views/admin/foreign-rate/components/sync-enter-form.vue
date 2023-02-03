<script>
import { syncChinaRateBaseForeignRate } from '@/api/base/base-foreign-rate'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'

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
      constant,
      rules: {
        currency: [{ required: true, message: '币别必填', trigger: 'blur' }],
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
        Promise.all([getDataDictionary([])]).then(([dicts, info]) => {
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
          syncChinaRateBaseForeignRate(this.form)
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
  <base-dialog :visible.sync="visible" width="500px" title="同步外汇汇率" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="70px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="币别" prop="currency">
            <business-autocomplete-basic
              v-model="form.currency"
              label="订单币别"
              placeholder="请输入订单币别"
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="日期" prop="date">
            <base-date-picker
              v-model="form.date"
              type="datetime"
              placeholder="选择发布日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

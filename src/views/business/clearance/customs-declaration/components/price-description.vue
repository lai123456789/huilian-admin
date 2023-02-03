<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  promiseItmesOne: '',
  promiseItmesTwo: '',
  promiseItmesThree: '',
  promiseItmesFour: '',
  promiseItmesFive: ''
}

export default {
  name: 'PriceDescription',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
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
        this.form = Object.assign(clone(form, true), this.tableRow)
        const { DICTS_WHETHER_STATUS } = constant
        Promise.all([getDataDictionary([DICTS_WHETHER_STATUS])]).then(([dicts]) => {
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
    handlePromiseItmesOneChange(v) {
      if (v === enums.WHETHER_STATUS.getFieldByKey('NO')) {
        this.form.promiseItmesTwo = enums.WHETHER_STATUS.getFieldByKey('NO')
      }
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.$emit('save', this.form, done)
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
  <base-dialog :visible.sync="visible" width="600px" title="价格说明" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="150px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="特殊关系确认" prop="promiseItmesOne">
            <base-select
              v-model="form.promiseItmesOne"
              placeholder="请选择"
              clearable
              :options="dicts[constant.DICTS_WHETHER_STATUS]"
              @change="handlePromiseItmesOneChange"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="价格影响确认" prop="promiseItmesTwo">
            <base-select
              v-model="form.promiseItmesTwo"
              :disabled="form.promiseItmesOne === '0'"
              placeholder="请选择"
              clearable
              :options="dicts[constant.DICTS_WHETHER_STATUS]"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="与货物有关的特许权使用费支付确认" prop="promiseItmesThree">
            <base-select v-model="form.promiseItmesThree" placeholder="请选择" clearable :options="dicts[constant.DICTS_WHETHER_STATUS]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="公式定价确认" prop="promiseItmesFour">
            <base-select v-model="form.promiseItmesFour" placeholder="请选择" clearable :options="dicts[constant.DICTS_WHETHER_STATUS]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="暂定价格确认" prop="promiseItmesFive">
            <base-select v-model="form.promiseItmesFive" placeholder="请选择" clearable :options="dicts[constant.DICTS_WHETHER_STATUS]" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

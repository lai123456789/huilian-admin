<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  stuff: '',
  prodValidDt: '',
  prodQgp: 0,
  engManEntCnm: '',
  goodsSpec: '',
  goodsBrand: '',
  produceDate: '',
  prodBatchNo: '',
  mnufctrRegNo: ''
}

export default {
  name: 'GoodSpecs',
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
  <base-dialog :visible.sync="visible" width="600px" title="编辑检验检疫货物规格" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="成分/原料/组分" prop="stuff">
            <base-input v-model="form.stuff" :clearable="false" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="产品有效期" prop="prodValidDt">
            <base-date-picker v-model="form.prodValidDt" :clearable="false" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="产品保质期(天)" prop="prodQgp">
            <base-input-number v-model="form.prodQgp" :clearable="false" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="境外生产企业" prop="engManEntCnm">
            <base-input v-model="form.engManEntCnm" :clearable="false" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="货物规格" prop="goodsSpec">
            <base-input v-model="form.goodsSpec" :clearable="false" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="货物品牌" prop="goodsBrand">
            <base-input v-model="form.goodsBrand" :clearable="false" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="生产日期" prop="produceDate">
            <base-date-picker v-model="form.produceDate" type="dates" :clearable="false" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="生产批次" prop="prodBatchNo">
            <base-input v-model="form.prodBatchNo" :clearable="false" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="生产单位代码" prop="mnufctrRegNo">
            <base-input v-model="form.mnufctrRegNo" :clearable="false" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

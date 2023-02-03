<script>
import { getBaseForeignRateById, saveBaseForeignRate, updateBaseForeignRate } from '@/api/base/base-foreign-rate'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

const form = {
  currency: '',
  buyingRate: 0,
  buyingPrice: 0,
  sellingRate: 0,
  sellingPrice: 0,
  releaseDateTime: ''
}

export default {
  name: 'EnterForm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
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
        releaseDateTime: [{ required: true, message: '发布日期必填', trigger: 'blur' }],
        buyingPrice: [{ required: true, message: '现钞买入价必填', trigger: 'blur' }],
        sellingPrice: [{ required: true, message: '现钞卖出价必填', trigger: 'blur' }],
        currency: [{ required: true, message: '币别必填', trigger: 'blur' }]
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
        Promise.all([
          getDataDictionary([]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseForeignRateById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              releaseDateTime: `${info.data.releaseDate} ${info.data.releaseTime}`,
              buyingRate: new BigNumber(Number(info.data.buyingRate)).times(100).toNumber(),
              buyingPrice: new BigNumber(Number(info.data.buyingPrice)).times(100).toNumber(),
              sellingRate: new BigNumber(Number(info.data.sellingRate)).times(100).toNumber(),
              sellingPrice: new BigNumber(Number(info.data.sellingPrice)).times(100).toNumber()
            })
          }
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
          const formData = Object.assign(clone(this.form, true), {
            releaseDate: this.form.releaseDateTime.split(' ')[0],
            releaseTime: this.form.releaseDateTime.split(' ')[1],
            buyingRate: new BigNumber(Number(this.form.buyingRate)).div(100).toNumber(),
            buyingPrice: new BigNumber(Number(this.form.buyingPrice)).div(100).toNumber(),
            sellingRate: new BigNumber(Number(this.form.sellingRate)).div(100).toNumber(),
            sellingPrice: new BigNumber(Number(this.form.sellingPrice)).div(100).toNumber()
          })
          delete formData.releaseDateTime
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveBaseForeignRate(formData)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}成功`)
                this.visible = false
                done()
                this.reLoad(false)
              })
              .catch(() => {
                done()
              })
          } else {
            updateBaseForeignRate(formData)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}成功`)
                this.visible = false
                done()
                // 刷新表格的时候，保存之前选中的数据
                this.reLoad(true)
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
  <base-dialog
    :visible.sync="visible"
    width="500px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="币别" prop="currency">
            <business-autocomplete-basic
              v-model="form.currency"
              label="订单币别"
              placeholder="请输入订单币别"
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
            ></business-autocomplete-basic> </base-form-item
        ></base-col>

        <base-col :span="24">
          <base-form-item label="现汇买入价" prop="buyingRate">
            <base-input-number v-model="form.buyingRate" :precision="4" placeholder="请输入现汇买入价" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="现钞买入价" prop="buyingPrice">
            <base-input-number v-model="form.buyingPrice" :precision="4" placeholder="请输入现钞买入价" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="现汇卖出价" prop="sellingRate">
            <base-input-number v-model="form.sellingRate" :precision="4" placeholder="请输入现汇卖出价" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="现钞卖出价" prop="sellingPrice">
            <base-input-number v-model="form.sellingPrice" :precision="4" placeholder="请输入现汇卖出价" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="发布日期" prop="releaseDateTime">
            <base-date-picker
              v-model="form.releaseDateTime"
              type="datetime"
              placeholder="选择发布日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </base-form-item>
        </base-col> </base-row
    ></base-form>
  </base-dialog>
</template>

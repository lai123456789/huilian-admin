<script>
import { getBaseTaxCategoryById, saveBaseTaxCategory, updateBaseTaxCategory } from '@/api/base/base-tax-category'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

const form = {
  codeNum: '',
  serviceName: '',
  serviceAbbName: '',
  smallTax: 0,
  generalTax: 0,
  taxExplan: ''
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
        codeNum: [{ required: true, message: '税收编码必填', trigger: 'blur' }],
        serviceName: [{ required: true, message: '商品或服务分类简称必填', trigger: 'blur' }]
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
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseTaxCategoryById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              generalTax: new BigNumber(Number(info.data.generalTax)).times(100).toNumber(),
              smallTax: new BigNumber(Number(info.data.smallTax)).times(100).toNumber()
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
            generalTax: new BigNumber(Number(this.form.generalTax)).div(100).toNumber(),
            smallTax: new BigNumber(Number(this.form.smallTax)).div(100).toNumber()
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveBaseTaxCategory(formData)
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
            updateBaseTaxCategory(formData)
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
    width="520px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="130px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="税收编码" prop="codeNum">
            <base-input v-model="form.codeNum" placeholder="请输入税收编码" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="商品或服务名称" prop="serviceName">
            <base-input v-model="form.serviceName" placeholder="请输入商品或服务名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="商品或服务分类简称" prop="serviceAbbName">
            <base-input v-model="form.serviceAbbName" placeholder="请输入商品或服务分类简称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="一般纳税人税率" prop="generalTax">
            <base-input-number v-model="form.generalTax" placeholder="请输入一般纳税人税率">
              <template slot="append">%</template>
            </base-input-number>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="小规模纳税人征收率" prop="smallTax">
            <base-input-number v-model="form.smallTax" placeholder="请输入小规模纳税人征收率">
              <template slot="append">%</template>
            </base-input-number>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="解释" prop="taxExplan">
            <base-input v-model="form.taxExplan" type="textarea" placeholder="请输入解释" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

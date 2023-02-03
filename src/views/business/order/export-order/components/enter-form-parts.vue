<script>
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  productName: '',
  productModel: '',
  productBrand: '',
  productOrigin: '',
  productUnit: '',
  qty: 0,
  netWeight: 0,
  grossWeight: 0,
  packages: 0,
  remark: ''
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
    handleTableData: Function,
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
        productName: [{ required: true, message: '品名必填', trigger: 'blur' }],
        productModel: [{ required: true, message: '型号必填', trigger: 'blur' }],
        qty: [{ required: true, message: '数量必填', validator: validatorNumRequired, trigger: 'blur' }]
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
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, this.tableRow)
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
          this.$message.success(`${enums.FORM_TYPE.getFieldByValue(this.type)}成功`)
          this.handleTableData(this.form, this.type)
          this.visible = false
          done()
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
        }
      })
    },
    handleProductNameSelect(rows) {
      const { productName, productModel, productBrand, productOrigin, productUnit } = rows[0]

      Object.assign(this.form, {
        productName,
        productModel,
        productBrand,
        productOrigin,
        productUnit
      })
    },
    handleProductModelSelect(rows) {
      const { productName, productModel, productBrand, productOrigin, productUnit } = rows[0]

      Object.assign(this.form, {
        productName,
        productModel,
        productBrand,
        productOrigin,
        productUnit
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
    width="700px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="60px" size="mini">
      <base-row>
        <base-col :span="12">
          <base-form-item label="品名" prop="productName">
            <business-autocomplete-product
              v-model="form.productName"
              value-key="productName"
              label="品名"
              placeholder="请输入品名"
              @select="handleProductNameSelect"
            ></business-autocomplete-product>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="型号" prop="productModel">
            <business-autocomplete-basic
              v-model="form.productModel"
              label="型号"
              placeholder="请输入型号"
              :trigger-on-focus="false"
              :is-exist="false"
              :module-name="constant.AUTOCOMPLETE_KEY_PRODUCT_MODEL"
              @select="handleProductModelSelect"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="品牌" prop="productBrand">
            <base-input v-model="form.productBrand" placeholder="请输入品牌" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="产地" prop="productOrigin">
            <business-autocomplete-ccl
              v-model="form.productOrigin"
              label="产地"
              placeholder="请输入产地"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
            ></business-autocomplete-ccl>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="单位" prop="productUnit">
            <business-autocomplete-basic
              v-model="form.productUnit"
              label="单位"
              placeholder="请输入单位"
              :module-name="constant.AUTOCOMPLETE_KEY_PRODUCT_UNIT"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="数量" prop="qty">
            <base-input-number v-model="form.qty" placeholder="请输入数量" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="净重" prop="netWeight">
            <base-input-number v-model="form.netWeight" placeholder="请输入数量" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="件数" prop="packages">
            <base-input-number v-model="form.packages" placeholder="请输入件数" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

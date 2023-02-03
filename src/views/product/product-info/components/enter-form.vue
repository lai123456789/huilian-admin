<script>
import { getProductInfoById, saveProductInfo, updateProductInfo } from '@/api/product/product-info'
import { productTypeTree } from '@/api/product/product-type'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  productName: '',
  productNo: '',
  productBrand: '',
  productModel: '',
  productOrigin: '',
  productUnit: '',
  productTypeName: '',
  productTypeId: '',
  productDesc: '',
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
      dicts: {},
      typeNameData: []
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
          productTypeTree(),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getProductInfoById(this.tableRow.id)
        ]).then(([dicts, productTypes, info]) => {
          this.dicts = dicts
          this.typeNameData = productTypes.data
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              productTypeId: info.data.productTypeId !== '0' ? info.data.productTypeId : ''
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
    handleProductTypeNameNodeClick(node) {
      Object.assign(this.form, {
        productTypeName: node.name
      })
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveProductInfo(this.form)
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
            updateProductInfo(this.form)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="商品编号" prop="productNo">
            <base-input v-model="form.productNo" disabled placeholder="请输入商品编号" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="品名" prop="productName">
            <base-input v-model="form.productName" placeholder="请输入品名" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="品牌" prop="productBrand">
            <base-input v-model="form.productBrand" placeholder="请输入品牌" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="型号" prop="productModel">
            <base-input v-model="form.productModel" placeholder="请输入型号" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="产地" prop="productOrigin">
            <business-autocomplete-ccl
              v-model="form.productOrigin"
              label="产地"
              placeholder="请输入产地"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
            ></business-autocomplete-ccl>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="单位" prop="productUnit">
            <business-autocomplete-basic
              v-model="form.productUnit"
              label="单位"
              placeholder="请输入单位"
              :module-name="constant.AUTOCOMPLETE_KEY_PRODUCT_UNIT"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="商品类别" prop="productTypeId">
            <base-tree-select
              v-model="form.productTypeId"
              check-strictly
              :props="{
                value: 'id',
                label: 'name'
              }"
              :data="typeNameData"
              placeholder="请选择商品类别"
              @node-click="handleProductTypeNameNodeClick"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="描述" prop="productDesc">
            <base-input v-model="form.productDesc" placeholder="请输入描述" />
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

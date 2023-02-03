<script>
import { getProductBrandById, saveProductBrand, updateProductBrand } from '@/api/product/product-brand'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  nameZh: '',
  nameEn: '',
  nameZhEn: '',
  type: ''
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
        const { DICTS_CUSTOMS_ELEMENT_BRAND_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_CUSTOMS_ELEMENT_BRAND_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getProductBrandById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
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
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveProductBrand(this.form)
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
            updateProductBrand(this.form)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="品牌中文名称" prop="nameZh">
            <base-input v-model="form.nameZh" placeholder="请输入品牌中文名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="品牌英文名称" prop="nameEn">
            <base-input v-model="form.nameEn" placeholder="请输入品牌英文名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="品牌中英文名称" prop="nameZhEn">
            <base-input v-model="form.nameZhEn" placeholder="请输入品牌中英文名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="品牌类型" prop="type">
            <base-select v-model="form.type" placeholder="请选择品牌类型" :options="dicts[constant.DICTS_CUSTOMS_ELEMENT_BRAND_TYPE]" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

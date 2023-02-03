<script>
import { getBaseProductControlById, saveBaseProductControl, updateBaseProductControl } from '@/api/base/base-product-control'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  productName: '',
  productModel: '',
  productDesc: '',
  controlType: '',
  controlFlag: enums.WHETHER_STATUS.getFieldByKey('NO')
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
        productModel: [{ required: true, message: '型号必填', trigger: 'blur' }]
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
        const { DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_WHETHER_STATUS]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseProductControlById(this.tableRow.id)
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
            saveBaseProductControl(this.form)
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
            updateBaseProductControl(this.form)
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
          <base-form-item label="品名" prop="productName">
            <base-input v-model="form.productName" placeholder="请输入品名" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="型号" prop="productModel">
            <base-input v-model="form.productModel" placeholder="请输入型号" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="商品说明" prop="productDesc">
            <base-input v-model="form.productDesc" type="textarea" placeholder="请输入商品说明" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="管制类别" prop="controlType">
            <base-input v-model="form.controlType" placeholder="请输入管制类别" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="是否管制品" prop="controlFlag">
            <base-radio v-model="form.controlFlag" is-group :options="dicts[constant.DICTS_WHETHER_STATUS]" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

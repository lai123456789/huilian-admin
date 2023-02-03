<script>
import { getBaseSettlementFormulaById, saveBaseSettlementFormula, updateBaseSettlementFormula } from '@/api/base/base-settlement-formula'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  name: '',
  formula: '',
  tradeMode: '',
  costType: '',
  sort: 1,
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
      rules: {
        name: [{ required: true, message: '公式名称必填', trigger: 'blur' }],
        formula: [{ required: true, message: '计算公式必填', trigger: 'blur' }],
        tradeMode: [{ required: true, message: '贸易模式必填', trigger: 'blur' }],
        costType: [{ required: true, message: '费用类型必填', trigger: 'blur' }]
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
        const { DICTS_COST_TYPE, DICTS_TRADE_MODE, DICTS_COST_MOLD } = constant
        Promise.all([
          getDataDictionary([DICTS_COST_TYPE, DICTS_TRADE_MODE, DICTS_COST_MOLD]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseSettlementFormulaById(this.tableRow.id)
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
            saveBaseSettlementFormula(this.form)
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
            updateBaseSettlementFormula(this.form)
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
          <base-form-item label="公式名称" prop="name">
            <base-input v-model="form.name" placeholder="请输入公式名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="计算公式" prop="formula">
            <base-input v-model="form.formula" placeholder="请输入计算公式" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="贸易模式" prop="tradeMode">
            <base-select v-model="form.tradeMode" placeholder="请选择贸易模式" :options="dicts[constant.DICTS_TRADE_MODE]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="费用类型" prop="costType">
            <base-select v-model="form.costType" placeholder="请选择费用类型" :options="dicts[constant.DICTS_COST_MOLD]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="排序" prop="sort">
            <base-input-number v-model="form.sort" controls align="center" />
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

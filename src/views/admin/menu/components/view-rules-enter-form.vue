<script>
import { getMenuDataRuleById, saveMenuDataRule, updateMenuDataRule } from '@/api/admin/menu-data-rule'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  status: enums.IS_ENABLED_STATUS.getFieldByKey('VALID'),
  ruleName: '',
  ruleColumn: '',
  ruleConditions: '',
  ruleValue: ''
}

export default {
  name: 'ViewRulesEnterForm',
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
        ruleName: [{ required: true, message: '规则名称必填', trigger: 'blur' }],
        ruleConditions: [{ required: true, message: '规则条件必填', trigger: 'blur' }],
        ruleValue: [{ required: true, message: '规则值必填', trigger: 'blur' }]
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
        const { DICTS_IS_ENABLED_STATUS, DICTS_RULE_CONDITIONS } = constant
        Promise.all([
          getDataDictionary([DICTS_IS_ENABLED_STATUS, DICTS_RULE_CONDITIONS]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getMenuDataRuleById(this.tableRow.menuId)
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
            saveMenuDataRule(this.form)
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
            updateMenuDataRule(this.form)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="权限状态" prop="status">
            <base-radio v-model="form.status" is-group :options="dicts[constant.DICTS_IS_ENABLED_STATUS]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="规则名称" prop="ruleName">
            <base-input v-model="form.ruleName" placeholder="请输入规则名称" />
          </base-form-item>
        </base-col>

        <base-col v-if="form.ruleConditions !== enums.RULE_CONDITIONS.getFieldByKey('USE_SQL_RULES')" :span="24">
          <base-form-item label="规则字段" prop="ruleColumn">
            <base-input v-model="form.ruleColumn" placeholder="请输入规则字段" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="规则条件" prop="ruleConditions">
            <base-select v-model="form.ruleConditions" placeholder="请选择规则条件" :options="dicts[constant.DICTS_RULE_CONDITIONS]" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="规则值" prop="ruleValue">
            <base-input
              v-if="form.ruleConditions !== enums.RULE_CONDITIONS.getFieldByKey('USE_SQL_RULES')"
              v-model="form.ruleValue"
              placeholder="请输入规则值"
            />
            <base-input v-else v-model="form.ruleValue" :rows="2" type="textarea" placeholder="请输入规则值" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<script>
import { getBaseVoucherTemplateById, saveBaseVoucherTemplate, updateBaseVoucherTemplate } from '@/api/base/base-voucher-template'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormDatasource from './enter-form-datasource'
import TableVisualConfig from './table-config'

const form = {
  status: enums.ENABLE_DISABLE.getFieldByKey('ENABLED'),
  templateName: '',
  companyName: '',
  companyNo: '',
  voucherWord: '',
  voucherDate: '',
  datasource: '',
  metadata: [],
  remark: ''
}

export default {
  name: 'EnterForm',
  components: { EnterFormDatasource, TableVisualConfig },
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
        templateName: [{ required: true, message: '模板名称必填' }],
        companyName: [{ required: true, message: '账套名称必填' }],
        companyNo: [{ required: true, message: '账套编码必填' }],
        voucherWord: [{ required: true, message: '凭证字必填' }],
        voucherDate: [{ required: true, message: '凭证日期必填' }]
      },
      dicts: {},
      datasource: {
        visible: false,
        row: {}
      },
      tableVisualConfig: {
        visible: false,
        type: 'edit'
      }
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_ENABLE_DISABLE } = constant
        Promise.all([
          getDataDictionary([DICTS_ENABLE_DISABLE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseVoucherTemplateById(this.tableRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts
          this.$nextTick(() => {
            this.getDetailsEditTableInstance().loadColumns(this.handleColumns())
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
            this.$nextTick(() => {
              this.getDetailsEditTableInstance().loadData(this.form.voucherTemplateEntryVOList || [])
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
    /** 明细列数据 */
    handleColumns() {
      return [
        {
          field: 'summary',
          title: '摘要',
          width: 200,
          type: 'input',
          rules: [{ required: true, message: '摘要必填' }]
        },
        {
          field: 'subjectNo',
          title: '科目编码',
          width: 200,
          type: 'input',
          rules: [{ required: true, message: '科目编码必填' }]
        },
        {
          field: 'subjectName',
          title: '科目名称',
          width: 200,
          type: 'input',
          rules: [{ required: true, message: '科目名称必填' }]
        },
        {
          field: 'borrowType',
          title: '借贷方向',
          width: 200,
          type: 'select',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_BORROW_TYPE)
            }
          }
        },
        {
          field: 'assistItem',
          title: '辅助核算项目',
          width: 200,
          type: 'input'
        },
        {
          field: 'datasource',
          title: '数据源',
          width: 100,
          render: (h, { row }) => {
            return (
              <el-button size="mini" onClick={() => this.openDatasource(row)}>
                编辑
              </el-button>
            )
          }
        },
        { field: 'remark', title: '备注', width: 120, type: 'input' }
      ]
    },
    openMetadata() {
      this.tableVisualConfig.visible = true
      this.tableVisualConfig.type = 'edit'
      this.$refs.tableConfigRef.parseJson(this.form.metadata ? JSON.parse(this.form.metadata) : {})
    },
    tableConfigSave(data) {
      this.form.metadata = JSON.stringify(data)
    },
    openDatasource(row) {
      this.datasource = {
        visible: true,
        row
      }
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`凭证模板明细: 第${rowIndex}行 ${rule.message}`)
            }
            const baseVoucherTemplateEntryDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign({ baseVoucherTemplateEntryDTOList }, this.form)
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveBaseVoucherTemplate(formData)
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
              updateBaseVoucherTemplate(formData)
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
          })
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
        }
      })
    },
    getFormInstance() {
      return this.$refs.formRef
    },
    getDetailsEditTableInstance() {
      return this.$refs.detailsEditTableRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="99%"
    custom-class="common-form-dialog voucher-template-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="状态" prop="status">
              <base-select
                v-model="form.status"
                placeholder="请选择状态"
                :clearable="false"
                :options="dicts[constant.DICTS_ENABLE_DISABLE]"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="模板名称" prop="templateName">
              <base-input v-model="form.templateName" placeholder="请输入模板名称" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="账套编码" prop="companyNo">
              <base-input v-model="form.companyNo" placeholder="请输入账套编码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="账套名称" prop="companyName">
              <base-input v-model="form.companyName" placeholder="请输入账套名称" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="凭证字" prop="voucherWord">
              <base-input v-model="form.voucherWord" placeholder="请输入凭证字" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="凭证日期" prop="voucherDate">
              <base-input v-model="form.voucherDate" placeholder="请输入凭证日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="元数据" prop="metadata">
              <el-button size="mini" @click="openMetadata">编辑</el-button>
            </base-form-item>
          </base-col>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="12">
            <base-form-item label="数据源" prop="datasource">
              <base-input v-model="form.datasource" type="textarea" placeholder="请输入数据源" />
            </base-form-item>
          </base-col>

          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 凭证模板明细 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          凭证模板明细
        </span>
        <base-edit-table ref="detailsEditTableRef" height="300px" :name="constant.TABLE_NAME_VOUCHER_TEMP_ENTER" />
      </div>
    </base-form>
    <enter-form-datasource v-model="datasource.visible" :table-row="datasource.row" />
    <table-visual-config
      ref="tableConfigRef"
      :visible.sync="tableVisualConfig.visible"
      :type="tableVisualConfig.type"
      @save="tableConfigSave"
    ></table-visual-config>
  </base-dialog>
</template>

<style lang="scss">
.voucher-template-dialog {
  .common-form-block {
    &.is-special {
      box-sizing: border-box;
      padding-bottom: 10px;
      .common-form-block-header {
        margin-bottom: 10px;
      }
    }
  }
}
</style>

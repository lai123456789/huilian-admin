<script>
import { getAcctCostShippingById, saveAcctCostShipping, updateAcctCostShipping } from '@/api/finance/acct-cost-shipping'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import dayjs from '@/utils/day'
import { validatorNumRequired } from '@/utils/validate'

const form = {
  costType: enums.COST_TYPE.getFieldByKey('VARIED'),
  costName: '',
  costDate: dayjs().format('YYYY-MM-DD'),
  costCurrency: '',
  costMoney: 0,
  remark: ''
}

export default {
  name: 'EnterFormCost',
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
    mainRow: Object,
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
        costName: [{ required: true, message: '费用名称必填' }],
        costCurrency: [{ required: true, message: '费用币别必填' }],
        costDate: [{ required: true, message: '费用发生日期必填' }],
        costMoney: [{ required: true, message: '费用金额必填', validator: validatorNumRequired }]
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
        const { DICTS_COST_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_COST_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctCostShippingById(this.mainRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
          } else {
            this.$nextTick(() => {
              this.getDetailsEditTableInstance().loadColumns(this.handleColumns())
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
          field: 'costName',
          title: '费用名称',
          width: 180,
          type: 'custom',
          rules: [{ required: true, message: '费用名称必填' }],
          customRender: (h, { row, column }) => {
            return (
              <business-autocomplete-basic
                vModel={row[column.field]}
                size="mini"
                module-name={constant.AUTOCOMPLETE_KEY_COST_ITEM}
                params={{
                  costType: this.form.costType
                }}
                label="费用名称"
                placeholder="请输入费用名称"
              />
            )
          }
        },
        {
          field: 'costMoney',
          width: 180,
          title: '费用金额',
          type: 'inputNumber',
          rules: [{ required: true, message: '费用金额必填' }],
          sum: true,
          attrs: {
            precision: 2
          }
        },
        { field: 'remark', title: '备注', width: 120, type: 'input' }
      ]
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            this.getDetailsEditTableInstance().validate(valids => {
              if (valids) {
                const { rowIndex, rule } = valids
                done()
                return this.$message.error(`费用明细: 第${rowIndex}行 ${rule.message}`)
              }
              const acctCostShippingDetailDTOList = this.getDetailsEditTableInstance().getRecords()
              saveAcctCostShipping(Object.assign({ shippingId: this.tableRow.id, acctCostShippingDetailDTOList }, this.form))
                .then(() => {
                  this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}成功`)
                  this.visible = false
                  done()
                  this.reLoad(false)
                })
                .catch(() => {
                  done()
                })
            })
          } else {
            updateAcctCostShipping(Object.assign({ shippingId: this.tableRow.id }, this.form))
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
    :width="type === enums.FORM_TYPE.getFieldByKey('ADDED') ? '99%' : '500px'"
    :custom-class="`common-form-dialog enter-form-cost-dialog ${type === enums.FORM_TYPE.getFieldByKey('MODIFY') && 'is-modify'}`"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <template v-if="type === enums.FORM_TYPE.getFieldByKey('ADDED')">
        <!-- 基本信息 -->
        <div class="common-form-block">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            基本信息
          </span>
          <base-row :gutter="10">
            <base-col :span="6">
              <base-form-item label="费用大类" prop="costType">
                <base-select v-model="form.costType" disabled :options="dicts[constant.DICTS_COST_TYPE]" />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="费用币别" prop="costCurrency">
                <business-autocomplete-basic
                  v-model="form.costCurrency"
                  label="费用币别"
                  placeholder="请输入费用币别"
                  :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                ></business-autocomplete-basic>
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="费用发生日期" prop="costDate">
                <base-date-picker v-model="form.costDate" type="date" placeholder="选择费用发生日期" />
              </base-form-item>
            </base-col>
          </base-row>
        </div>

        <!-- 费用明细 -->
        <div class="common-form-block is-special">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            费用明细
          </span>
          <base-edit-table ref="detailsEditTableRef" height="300px" :name="constant.TABLE_NAME_WARE_SHIPPING_COST_ENTER" />
        </div>
      </template>
      <template v-else>
        <base-row :gutter="10">
          <base-col :span="24">
            <base-form-item label="费用大类" prop="costType">
              <base-select v-model="form.costType" disabled :options="dicts[constant.DICTS_COST_TYPE]" />
            </base-form-item>
          </base-col>

          <base-col :span="24">
            <base-form-item label="费用名称" prop="costName">
              <business-autocomplete-basic
                v-model="form.costName"
                label="费用名称"
                placeholder="请输入费用名称"
                disabled
                :params="{
                  costType: form.costType
                }"
                :module-name="constant.AUTOCOMPLETE_KEY_COST_ITEM"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="24">
            <base-form-item label="费用币别" prop="costCurrency">
              <business-autocomplete-basic
                v-model="form.costCurrency"
                label="费用币别"
                placeholder="请输入费用币别"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="24">
            <base-form-item label="费用金额" prop="costMoney">
              <base-input-number v-model="form.costMoney" placeholder="请输入费用金额" />
            </base-form-item>
          </base-col>

          <base-col :span="24">
            <base-form-item label="费用发生日期" prop="costDate">
              <base-date-picker v-model="form.costDate" type="date" placeholder="选择费用发生日期" />
            </base-form-item>
          </base-col>

          <base-col :span="24">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </template>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.enter-form-cost-dialog {
  &.is-modify {
    .base-dialog-body {
      padding: 10px;
    }
  }
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

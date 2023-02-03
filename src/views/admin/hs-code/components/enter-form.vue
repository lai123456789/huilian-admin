<script>
import { getBaseCustomsCodeById, saveBaseCustomsCode, updateBaseCustomsCode } from '@/api/base/base-customs-code'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

const form = {
  productName: '',
  productCode: '',
  firstUnit: '',
  secondUnit: '',
  supervisionCondition: '',
  inspectionCategory: '',
  vatRate: 0,
  exciseRate: 0,
  preferentialRate: 0,
  exRate: 0,
  exRebateRate: 0,
  exTentativeRate: void 0,
  imGeneralRate: null,
  imTentativeRate: void 0
}

export default {
  name: 'EnterForm',
  components: {},
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
        productName: [{ required: true, message: '商品名称必填' }],
        productCode: [{ required: true, message: '商品编码必填' }]
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
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getBaseCustomsCodeById(this.tableRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts
          this.$nextTick(() => {
            this.getClassifyElementsTableInstance().loadColumns(this.handleColumns()[0])
            this.getCiqTableInstance().loadColumns(this.handleColumns()[1])
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            const { vatRate, exciseRate, preferentialRate, exRate, exRebateRate, exTentativeRate, imGeneralRate, imTentativeRate } =
              info.data

            Object.assign(this.form, info.data, {
              vatRate: new BigNumber(vatRate).times(100).toNumber(),
              exciseRate: new BigNumber(exciseRate).times(100).toNumber(),
              preferentialRate: new BigNumber(preferentialRate).times(100).toNumber(),
              exRate: new BigNumber(exRate).times(100).toNumber(),
              exRebateRate: new BigNumber(exRebateRate).times(100).toNumber(),
              exTentativeRate: !exTentativeRate ? new BigNumber(exTentativeRate).times(100).toNumber() : void 0,
              imGeneralRate: new BigNumber(imGeneralRate).times(100).toNumber(),
              imTentativeRate: !imTentativeRate ? new BigNumber(imTentativeRate).times(100).toNumber() : void 0
            })

            this.$nextTick(() => {
              this.getClassifyElementsTableInstance().loadData(this.form.baseCustomsCodeElementVOList || [], 'cover')
              this.getCiqTableInstance().loadData(this.form.baseCustomsCodeCiqVOList || [], 'cover')
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
    /** 列数据 */
    handleColumns() {
      return [
        // 商品申报要素信息
        [{ field: 'elementName', title: '申报要素', type: 'input' }],
        // ciq编码
        [
          { field: 'ciqCode', width: 250, title: 'CIQ编码', type: 'input' },
          { field: 'ciqName', title: 'CIQ名称', type: 'input' }
        ]
      ]
    },
    handleValidateSave(done) {
      this.getFormInstance().validate((valids, invalidFields) => {
        if (!valids) {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
          return
        }
        this.getClassifyElementsTableInstance().validate(validsClassifyElements => {
          if (validsClassifyElements) {
            const { rowIndex, rule } = validsClassifyElements
            return this.$message.error(`商品申报要素信息: 第${rowIndex + 1}行 ${rule.message}`)
          }
          this.getCiqTableInstance().validate(validsCiq => {
            if (validsCiq) {
              const { rowIndex, rule } = validsCiq
              return this.$message.error(`CIQ编码: 第${rowIndex + 1}行 ${rule.message}`)
            }
            this.handleSave(this.form, done)
          })
        })
      })
    },
    handleSave(form, done) {
      const baseCustomsCodeElementDTOList = this.getClassifyElementsTableInstance().getRecords()
      const baseCustomsCodeCiqDTOList = this.getCiqTableInstance().getRecords()
      const { vatRate, exciseRate, preferentialRate, exRate, exRebateRate, exTentativeRate, imGeneralRate, imTentativeRate } = form
      const formData = Object.assign(clone(form), {
        baseCustomsCodeElementDTOList,
        baseCustomsCodeCiqDTOList,
        vatRate: new BigNumber(vatRate).div(100).toNumber(),
        exciseRate: new BigNumber(exciseRate).div(100).toNumber(),
        preferentialRate: new BigNumber(preferentialRate).div(100).toNumber(),
        exRate: new BigNumber(exRate).div(100).toNumber(),
        exRebateRate: new BigNumber(exRebateRate).div(100).toNumber(),
        exTentativeRate: !exTentativeRate ? new BigNumber(exTentativeRate).div(100).toNumber() : void 0,
        imGeneralRate: new BigNumber(imGeneralRate).div(100).toNumber(),
        imTentativeRate: !imTentativeRate ? new BigNumber(imTentativeRate).div(100).toNumber() : void 0
      })
      if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
        saveBaseCustomsCode(formData)
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
        updateBaseCustomsCode(formData)
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
    },
    getFormInstance() {
      return this.$refs.formRef
    },
    getClassifyElementsTableInstance() {
      return this.$refs.classifyElementsTableRef
    },
    getCiqTableInstance() {
      return this.$refs.ciqTableRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="99%"
    custom-class="common-form-dialog hs-code-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleValidateSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="商品名称" prop="productName">
              <base-input v-model="form.productName" placeholder="请输入商品名称" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="商品编码" prop="productCode">
              <base-input v-model="form.productCode" placeholder="请输入商品编码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="第一法定单位" prop="firstUnit">
              <business-autocomplete-ccl
                v-model="form.firstUnit"
                label="第一法定单位"
                placeholder="第一法定单位"
                :module-name="constant.AUTOCOMPLETE_KEY_CCL_UNIT"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="第二法定单位" prop="secondUnit">
              <business-autocomplete-ccl
                v-model="form.secondUnit"
                label="第二法定单位"
                placeholder="第二法定单位"
                :module-name="constant.AUTOCOMPLETE_KEY_CCL_UNIT"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="监管条件" prop="supervisionCondition">
              <base-input v-model="form.supervisionCondition" placeholder="请输入监管条件" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="检验检疫类别" prop="inspectionCategory">
              <base-input v-model="form.inspectionCategory" placeholder="请输入检验检疫类别" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="(进口)增值税率" prop="vatRate">
              <base-input-number v-model="form.vatRate" placeholder="请输入(进口)增值税率">
                <template slot="append">%</template>
              </base-input-number>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="(进口)消费税率" prop="exciseRate">
              <base-input-number v-model="form.exciseRate" placeholder="请输入(进口)消费税率">
                <template slot="append">%</template>
              </base-input-number>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="(进口)最惠国税率" prop="preferentialRate">
              <base-input-number v-model="form.preferentialRate" placeholder="请输入(进口)最惠国税率">
                <template slot="append">%</template>
              </base-input-number>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="(出口)关税率" prop="exRate">
              <base-input-number v-model="form.exRate" placeholder="请输入(出口)关税率">
                <template slot="append">%</template>
              </base-input-number>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="(出口)退税率" prop="exRebateRate">
              <base-input-number v-model="form.exRebateRate" placeholder="请输入(出口)退税率">
                <template slot="append">%</template>
              </base-input-number>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="(出口)暂定税率" prop="exTentativeRate">
              <base-input-number v-model="form.exTentativeRate" placeholder="请输入(出口)暂定税率">
                <template slot="append">%</template>
              </base-input-number>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="(进口)普通国税率" prop="imGeneralRate">
              <base-input-number v-model="form.imGeneralRate" placeholder="请输入(进口)普通国税率">
                <template slot="append">%</template>
              </base-input-number>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="(进口)暂定税率" prop="imTentativeRate">
              <base-input-number v-model="form.imTentativeRate" placeholder="请输入(进口)暂定税率">
                <template slot="append">%</template>
              </base-input-number>
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <div class="common-form-block is-special">
        <div class="common-form-block-item">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            商品申报要素信息
          </span>
          <base-edit-table
            ref="classifyElementsTableRef"
            height="300px"
            show-sort
            :name="constant.TABLE_NAME_BASE_HS_CODE_CLASSIFY_ELEMENTS_ENTER"
          />
        </div>
        <div class="common-form-block-item">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            CIQ编码
          </span>
          <base-edit-table ref="ciqTableRef" height="300px" show-sort :name="constant.TABLE_NAME_BASE_HS_CODE_CIQ_ENTER" />
        </div>
      </div>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.hs-code-dialog {
  .common-form-block {
    &-item {
      display: inline-block;
      width: 50%;
      vertical-align: top;
      &:last-child {
        .base-edit-table {
          padding-left: 0;
        }
      }
    }
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

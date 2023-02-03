<script>
import { updateDeclarCustomsMasterDetail } from '@/api/customs/customs-master-detail'
import { getBaseCustomsCodeById } from '@/api/base/base-customs-code'
import { getCustomsNameDeclarById } from '@/api/customs/customs-name-declar'
import { getProductBrandByBrandName } from '@/api/product/product-brand'
import { getDataDictionary } from '@/api/admin/dicts'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import config from '@/config'
import BigNumber from '@/utils/big-number'

const ENUM = {
  品牌类型: {
    valueKey: 'productBrandType',
    conponentType: 'select',
    items: constant.DICTS_CUSTOMS_ELEMENT_BRAND_TYPE,
    rules: { required: true, message: '品牌类型必填' },
    disabled: false
  },
  出口享惠情况: {
    conponentType: 'select',
    items: constant.DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT,
    rules: { required: true, message: '出口享惠情况必填' },
    disabled: false
  },
  '品牌(中文或外文名称)': {
    valueKey: 'productBrandNameZhEn',
    rules: { required: true, message: '品牌(中文或外文名称)必填' },
    disabled: false
  },
  型号: { valueKey: 'productModelName', rules: { required: true, message: '型号必填' }, disabled: false }
}

const blurbForm = {
  customerName: '',
  orderNo: '',
  productName: '',
  productModel: '',
  productBrand: '',
  productOrigin: '',
  productUnit: '',
  cccNo: '',
  cccFlag: '0',
  controlFlag: '0',
  exemptionLevy: '0',
  exemptionTariff: '0',
  controlLicenseNo: '',
  ciqCode: '',
  ciqName: '',
  remark: ''
}

const form = {
  customsCode: '',
  customsName: '',
  declareRemark: '',
  classifyElements: [],
  classifyElementInfo: '',
  customsCodeName: '',
  firstUnit: '',
  secondUnit: '',
  supervisionCondition: '',
  inspectionCategory: '',
  imTentativeRate: 0,
  preferentialRate: 0,
  imGeneralRate: 0,
  addTariffRate: 0,
  vatRate: 0,
  exciseRate: 0,
  taxRate: 0,
  rebateRate: 0,
  exTentativeRate: 0
}
export default {
  name: 'Classify',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    currentClear: {
      type: Function,
      default: () => () => {}
    },
    orderType: String
  },
  data() {
    return {
      enums,
      constant,
      form: clone(form, true),
      blurbForm: clone(blurbForm, true),
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      rules: {
        customsCode: [{ required: true, message: '海关编码必填' }],
        customsName: [{ required: true, message: '报关名称必填' }]
      },
      dicts: {},
      saveLoading: false
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    // 入口方法(弹窗打开时会优先调用)
    handleAssignForm(row) {
      this.form = clone(form, true)
      this.blurbForm = clone(blurbForm, true)
      const {
        id,
        productBrand,
        productModel,
        cccFlag,
        cccNo,
        controlFlag,
        controlLicenseNo,
        exemptionLevy,
        exemptionTariff,
        customsCode,
        customsName,
        ciqCode,
        ciqName,
        customsCodeName,
        firstUnit,
        secondUnit,
        vatRate,
        exciseRate,
        taxRate,
        rebateRate,
        declareRemark,
        classifyElements
      } = row
      this.row = row
      Object.assign(this.blurbForm, {
        id,
        productBrand,
        productModel,
        cccFlag,
        cccNo,
        controlFlag,
        controlLicenseNo,
        exemptionLevy,
        exemptionTariff
      })
      Object.assign(this.form, {
        id,
        customsCode,
        customsName,
        ciqCode,
        ciqName,
        customsCodeName,
        firstUnit,
        secondUnit,
        vatRate,
        exciseRate,
        taxRate,
        rebateRate,
        declareRemark
      })
      const { DICTS_WHETHER_STATUS, DICTS_IS_3C, DICTS_CUSTOMS_ELEMENT_BRAND_TYPE, DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT } = constant
      Promise.all([
        getDataDictionary([DICTS_WHETHER_STATUS, DICTS_IS_3C, DICTS_CUSTOMS_ELEMENT_BRAND_TYPE, DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT]),
        publicValueSysPublicParamByPublicKey(constant.PARAMS_ORDER_CLASSIFIED)
      ]).then(([dicts, defaultConfig]) => {
        this.dicts = dicts
        this.defaultConfig = defaultConfig.data || {}

        this.generateClassifyElements(clone(classifyElements, true) || []).then(classifyElements => {
          this.form.classifyElements = classifyElements
          this.handleClassifyElementSplice()
        })
      })
    },
    async handleCustomsCodeSelect(rows) {
      const { id } = rows[0]
      const res = await getBaseCustomsCodeById(id)
      const { data, code } = res
      if (code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        Object.assign(this.form, data, { id: this.form.id })
        this.form.classifyElements = []
        const classifyElements = await this.generateClassifyElements(data.baseCustomsCodeElementVOList || [])
        this.form.classifyElements = classifyElements
        this.handleClassifyElementSplice()
      }
    },
    async handleCustomsNameSelect(rows) {
      const { id } = rows[0]
      const res = await getCustomsNameDeclarById(id)
      const { data, code } = res
      if (code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        this.form.classifyElements = []
        Object.assign(this.form, data, { id: this.form.id })
        const classifyElements = await this.generateClassifyElements(data.customsNameDeclarElementVOList || [])
        this.form.classifyElements = classifyElements
        this.handleClassifyElementSplice()
      }
    },
    handleCustomsCodeClear() {
      this.form = Object.assign(this.form, clone(form, true))
      Object.assign(this.blurbForm, {
        ciqCode: '',
        ciqName: ''
      })
    },
    async generateClassifyElements(data = []) {
      const classifyElements = []
      for (let i = 0; i < data.length; i++) {
        const { elementName, elementValue } = data[i]
        let dicts = []
        let type = 'input'
        if (ENUM[elementName] && 'conponentType' in ENUM[elementName] && ENUM[elementName].conponentType === 'select') {
          dicts = this.dicts[ENUM[elementName].items]
          type = 'select'
        }

        if (elementName === '品牌(中文或外文名称)') {
          await this.assignProductBrand(elementValue, classifyElements)
        } else if (elementName === '型号') {
          this.assignProductModelName(elementValue)
        }

        classifyElements.push({
          elementName,
          // 根据品牌带出品牌类型和中英文名称
          elementValue:
            (ENUM[elementName] && 'valueKey' in ENUM[elementName]
              ? typeof ENUM[elementName].valueKey === 'function'
                ? ENUM[elementName].valueKey(this)
                : this[ENUM[elementName].valueKey]
              : '') ||
            elementValue ||
            '',
          rules:
            ENUM[elementName] && 'rules' in ENUM[elementName]
              ? Array.isArray(ENUM[elementName].rules)
                ? ENUM[elementName].rules
                : [ENUM[elementName].rules]
              : [],
          type,
          disabled: ENUM[elementName]
            ? typeof ENUM[elementName].disabled === 'function'
              ? ENUM[elementName].disabled(this)
              : ENUM[elementName].disabled
            : false,
          options: dicts
        })
      }
      return classifyElements
    },
    handleClassifyElementSplice() {
      this.form.classifyElementInfo = this.form.classifyElements.map(v => v.elementValue || '').join('|')
    },
    convertTaxRate(num) {
      return `${new BigNumber(Number(num)).times(100)}%`
    },
    async assignProductBrand(elementValue, classifyElements) {
      const productBrand = elementValue || this.blurbForm.productBrand
      if (productBrand) {
        const productBrandNothing = config.productBrandNothings
        if (productBrandNothing.includes(productBrand)) {
          this.productBrandNameZhEn = config.defaultProductBrandEmpty
          this.handleAgainAssign(classifyElements, '')
        } else {
          if (!elementValue) {
            const res = await getProductBrandByBrandName({ name: this.blurbForm.productBrand })
            // 如果为空时，productBrandNameZhEn =  defaultProductBrandEmpty 和 productBrandType = ''
            if (res.data) {
              const { nameZhEn, type } = res.data
              this.productBrandNameZhEn = this.transformValues(nameZhEn, 'productBrand')
              this.handleAgainAssign(classifyElements, type)
            } else {
              this.productBrandNameZhEn = this.transformValues(this.blurbForm.productBrand, 'productBrand')
              this.handleAgainAssign(classifyElements, '')
            }
          }
        }
      } else {
        this.productBrandNameZhEn = config.defaultProductBrandEmpty
        this.handleAgainAssign(classifyElements, '')
      }
    },
    async assignProductModelName(elementValue) {
      const productModel = elementValue || this.form.productModel
      if (productModel) {
        const productModelNothing = config.productModelNothings
        if (productModelNothing.includes(productModel)) {
          this.productModelName = config.defaultProductModelEmpty
        } else {
          this.productModelName = this.transformValues(productModel, 'productModel')
        }
      } else {
        this.productModelName = config.defaultProductModelEmpty
      }
    },
    // 用于重新赋值品牌类型
    handleAgainAssign(classifyElements, type) {
      let target = null
      if (classifyElements) {
        target = classifyElements.find(v => v.elementName === '品牌类型')
      }
      if (target) {
        target.elementValue = type || target.elementValue
      } else {
        this.productBrandType = type
      }
    },
    transformValues(value, type) {
      const str = type === 'productBrand' ? this.defaultConfig.concatBrand : this.defaultConfig.concatModel
      if (value) {
        const valueStr = value.substr(value.length - 1, 1) !== str ? value + str : value
        if (type === 'productBrand') {
          return this.defaultConfig.productBrandUpperCase === enums.PRODUCT_BRAND_AND_MODEL_UPPERCASE.getFieldByKey('UPPER_CASE')
            ? valueStr.toUpperCase()
            : valueStr
        } else {
          return this.defaultConfig.productModelUpperCase === enums.PRODUCT_BRAND_AND_MODEL_UPPERCASE.getFieldByKey('UPPER_CASE')
            ? valueStr.toUpperCase()
            : valueStr
        }
      } else {
        return value
      }
    },
    handleCccFlagChange() {
      this.blurbForm.cccNo = ''
    },
    handleControlFlagChange() {
      this.blurbForm.controlLicenseNo = ''
    },
    handleSave() {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getBlurbFormInstance().validate(async (blurbFormValid, blurbFormMsgs) => {
            if (blurbFormValid) {
              const { id, cccFlag, cccNo, ciqCode, ciqName, controlFlag, controlLicenseNo } = this.blurbForm
              const { customsCode, customsName, declareRemark, exemptionLevy, exemptionTariff, classifyElements } = this.form
              const formData = {
                id,
                cccFlag,
                cccNo,
                ciqCode,
                ciqName,
                controlFlag,
                controlLicenseNo,
                customsCode,
                customsName,
                declareRemark,
                exemptionLevy,
                exemptionTariff,
                customsMasterDetailElementDTOList: classifyElements.map(v => ({
                  elementName: v.elementName,
                  elementValue: v.elementValue
                }))
              }
              updateDeclarCustomsMasterDetail(formData).then(() => {
                this.reLoad()
                this.currentClear()
                this.$message.success('操作成功')
                this.saveLoading = false
                this.visible = false
              })
            } else {
              // 通过 el-message 的形式展示错误信息
              this.getBlurbFormInstance().useErrorByMessage(blurbFormMsgs)
              this.saveLoading = false
            }
          })
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          this.saveLoading = false
        }
      })
    },
    getFormInstance() {
      return this.$refs.formRef
    },
    getBlurbFormInstance() {
      return this.$refs.blurbFormRef
    }
  }
}
</script>

<template>
  <base-dialog
    custom-class="classify-dialog"
    :visible.sync="visible"
    width="1100px"
    title="商品规范申报-商品申报要素"
    :show-save="false"
    :show-footer="disabled"
  >
    <base-row>
      <base-col :span="6" style="padding-right: 10px">
        <base-form ref="blurbFormRef" :model="blurbForm" label-suffix=":" label-width="80px" size="mini">
          <base-row>
            <base-col :span="24">
              <base-form-item label="是否需要3C" prop="cccFlag">
                <base-select v-model="blurbForm.cccFlag" :disabled="!disabled" :clearable="false" :options="dicts[constant.DICTS_IS_3C]" />
              </base-form-item>
            </base-col>

            <base-col v-if="blurbForm.cccFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="24">
              <base-form-item label="3C认证编号" prop="cccNo">
                <base-input v-model="blurbForm.cccNo" :disabled="!disabled" placeholder="请输入3C认证编号" />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="是否管制品" prop="controlFlag">
                <base-select
                  v-model="blurbForm.controlFlag"
                  :clearable="false"
                  :disabled="!disabled"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                />
              </base-form-item>
            </base-col>

            <base-col v-if="blurbForm.controlFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="24">
              <base-form-item label="管制品许可证号" prop="controlLicenseNo">
                <base-input v-model="blurbForm.controlLicenseNo" :disabled="!disabled" placeholder="请输入管制品许可证号" />
              </base-form-item>
            </base-col>

            <base-col v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')" :span="24">
              <base-form-item label="减免加征" prop="exemptionLevy">
                <base-select
                  v-model="blurbForm.exemptionLevy"
                  :disabled="!disabled"
                  :clearable="false"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                />
              </base-form-item>
            </base-col>

            <base-col v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')" :span="24">
              <base-form-item label="减免关税" prop="exemptionTariff">
                <base-select
                  v-model="blurbForm.exemptionTariff"
                  :disabled="!disabled"
                  :clearable="false"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="CIQ代码" prop="ciqCode">
                <business-autocomplete-basic
                  v-model="blurbForm.ciqCode"
                  label="CIQ代码"
                  :disabled="!disabled"
                  placeholder="请输入CIQ代码"
                  :module-name="constant.AUTOCOMPLETE_KEY_CIQ_CODE"
                  :params="{
                    productCode: form.customsCode
                  }"
                  :auto-assign="{
                    ciqName: 'ciqName'
                  }"
                  :form="blurbForm"
                  @clear="() => (blurbForm.ciqName = '')"
                />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="CIQ名称" prop="ciqName">
                <base-input v-model="blurbForm.ciqName" :disabled="!disabled" placeholder="请输入CIQ名称" />
              </base-form-item>
            </base-col>
          </base-row>
        </base-form>
      </base-col>
      <base-col :span="18">
        <base-form ref="formRef" :model="form" :rules="rules" size="mini">
          <table class="classify-table" cellspacing="0" cellpadding="0">
            <tbody>
              <!-- 海关编码/海关编码名称 -->
              <tr>
                <td class="label">
                  <div class="content">海关编码</div>
                </td>
                <td>
                  <div class="content customs-code">
                    <base-form-item prop="customsCode">
                      <business-autocomplete-basic
                        v-model="form.customsCode"
                        label="海关编码"
                        :disabled="!disabled"
                        placeholder="请输入海关编码"
                        :form="form"
                        :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMS_CODE"
                        @select="handleCustomsCodeSelect"
                        @clear="handleCustomsCodeClear"
                      ></business-autocomplete-basic>
                    </base-form-item>
                  </div>
                </td>
                <td class="label">
                  <div class="content">海关编码名称</div>
                </td>
                <td>
                  <div class="content">{{ form.customsCodeName }}</div>
                </td>
              </tr>
              <!-- 报关名称 -->
              <tr>
                <td class="label">
                  <div class="content">报关名称</div>
                </td>
                <td colspan="3">
                  <div class="content">
                    <base-form-item prop="customsName">
                      <business-autocomplete-basic
                        v-model="form.customsName"
                        :disabled="!disabled"
                        label="报关名称"
                        placeholder="请输入报关名称"
                        :form="form"
                        :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMS_NAME_DECLAR"
                        @select="handleCustomsNameSelect"
                        @clear="handleCustomsCodeClear"
                      ></business-autocomplete-basic>
                    </base-form-item>
                  </div>
                </td>
              </tr>
              <!-- 申报要素 -->
              <tr>
                <td class="label">
                  <div class="content">申报要素</div>
                </td>
                <td colspan="3">
                  <div class="content">{{ form.classifyElementInfo }}</div>
                </td>
              </tr>
              <!-- 申报要素详情 -->
              <tr>
                <td class="label">
                  <div class="content">申报要素详情</div>
                </td>
                <td colspan="3">
                  <div class="content">
                    <table class="classify-elements" cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr v-for="(item, index) in form.classifyElements" :key="item.elementName">
                          <td style="width: 30%">
                            <div class="content">
                              <div class="title">{{ index + 1 }}: {{ item.elementName }}</div>
                            </div>
                          </td>
                          <td style="width: 70%">
                            <div class="content">
                              <base-form-item :prop="`classifyElements.${index}.elementValue`" :rules="item.rules">
                                <template>
                                  <base-select
                                    v-if="item.type === 'select'"
                                    v-model="item.elementValue"
                                    clearable
                                    placeholder="请选择"
                                    :options="item.options"
                                    :disabled="!disabled ? !disabled : item.disabled"
                                    @change="handleClassifyElementSplice"
                                  />
                                  <base-input
                                    v-else
                                    v-model="item.elementValue"
                                    type="textarea"
                                    :disabled="!disabled ? !disabled : item.disabled"
                                    :autosize="{ minRows: 1, maxRows: 4 }"
                                    :placeholder="`请输入${item.elementName}`"
                                    @input="handleClassifyElementSplice"
                                  />
                                </template>
                              </base-form-item>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
              <!-- 法一单位/法二单位 -->
              <tr>
                <td class="label">
                  <div class="content">法一单位</div>
                </td>
                <td>
                  <div class="content">{{ form.firstUnit }}</div>
                </td>
                <td class="label">
                  <div class="content">法二单位</div>
                </td>
                <td>
                  <div class="content">{{ form.secondUnit }}</div>
                </td>
              </tr>
              <!-- 海关监管条件/检验检疫类别 -->
              <tr>
                <td class="label">
                  <div class="content">海关监管条件</div>
                </td>
                <td>
                  <div class="content">{{ form.supervisionCondition }}</div>
                </td>
                <td class="label">
                  <div class="content">检验检疫类别</div>
                </td>
                <td>
                  <div class="content">{{ form.inspectionCategory }}</div>
                </td>
              </tr>
              <!-- 暂定税率/最惠国税率 -->
              <tr>
                <td class="label">
                  <div class="content">(进口)暂定税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.imTentativeRate) }}</div>
                </td>
                <td class="label">
                  <div class="content">(进口)最惠国税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.preferentialRate) }}</div>
                </td>
              </tr>
              <!-- 普通国税率/增值税率 -->
              <tr>
                <td class="label">
                  <div class="content">(进口)普通国税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.imGeneralRate) }}</div>
                </td>
                <td class="label">
                  <div class="content">(进口)增值税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.vatRate) }}</div>
                </td>
              </tr>
              <!-- 消费税率/追加关税率 -->
              <tr>
                <td class="label">
                  <div class="content">(进口)消费税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.exciseRate) }}</div>
                </td>
                <td class="label">
                  <div class="content">(进口)追加关税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.addTariffRate) }}</div>
                </td>
              </tr>
              <!-- 关税率/退税率 -->
              <tr>
                <td class="label">
                  <div class="content">(出口)关税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.taxRate) }}</div>
                </td>
                <td class="label">
                  <div class="content">(出口)退税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.rebateRate) }}</div>
                </td>
              </tr>

              <!-- 暂定税率 -->
              <tr>
                <td class="label">
                  <div class="content">(出口)暂定税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.exTentativeRate) }}</div>
                </td>
              </tr>

              <!-- 归类备注 -->
              <tr>
                <td class="label">
                  <div class="content">归类备注</div>
                </td>
                <td colspan="3">
                  <div class="content">
                    <base-form-item prop="declareRemark">
                      <base-input v-model="form.declareRemark" :disabled="!disabled" type="textarea" placeholder="请输入归类备注" />
                    </base-form-item>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </base-form>
      </base-col>
    </base-row>
    <template #footer>
      <el-button type="success" size="mini" :loading="saveLoading" @click="handleSave()">确认归类</el-button>
    </template>
  </base-dialog>
</template>

<style lang="scss">
.classify-dialog {
  .classify-table {
    width: 100%;
    border: 1px solid var(--color-primary);
    .classify-elements {
      width: 100%;
      border: 1px solid var(--color-primary);
      .title {
        font-weight: 700;
      }
    }
    td {
      width: 25%;
      font-size: 14px;
      border: 1px solid var(--color-primary);
      &.label {
        width: 20%;
        background-color: #eef5fe;
        .content {
          padding-top: 0;
          padding-bottom: 0;
          height: 34px;
          line-height: 34px;
        }
      }
      .content {
        padding: 5px 10px;
        .el-form-item--mini.el-form-item {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>

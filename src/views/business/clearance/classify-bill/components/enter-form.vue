<script>
import {
  getOrderImportDetailDeclarById,
  updateOrderImportDetailDeclar,
  batchDeclareCustomsDeclartOrderImpor
} from '@/api/order/order-import-detail-declar'
import {
  getOrderExportDetailDeclarById,
  updateOrderExportDetailDeclar,
  batchDeclareCustomsDeclartOrderExport
} from '@/api/order/order-export-detail-declar'
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
    valueKey: function (instance) {
      return instance.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT') ? '3' : ''
    },
    conponentType: 'select',
    items: constant.DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT,
    rules: { required: true, message: '出口享惠情况必填' },
    disabled: function (instance) {
      return instance.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
    }
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
  declareRemark: '',
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
  exRate: 0,
  exRebateRate: 0,
  exTentativeRate: 0
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
    orderType: String,
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    isBatchClassify: Boolean,
    batchClassifyRows: Array
  },
  data() {
    this.productBrandType = ''
    this.productBrandNameZhEn = ''
    this.productModelName = ''
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      blurbForm: clone(blurbForm, true),
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
      if (newValue) {
        this.form = clone(form, true)
        let rowId = this.tableRow.id
        if (this.isBatchClassify) {
          const data = []
          this.batchClassifyRows.forEach(({ id, customsCode, productBrand, productModel, declareRemark }) => {
            // 取有海关编码的第一条数据
            if (customsCode && !rowId) {
              rowId = id
            }
            data.push({ productBrand, productModel, declareRemark })
          })
          this.$nextTick(() => {
            this.$refs.tableRef.loadColumns([
              { width: 80, field: 'productModel', title: '型号' },
              { width: 80, field: 'productBrand', title: '品牌' },
              { width: 350, field: 'declareRemark', title: '客户申报要素' }
            ])
            this.$refs.tableRef.loadData(data, 'cover')
          })
        }
        const {
          DICTS_WHETHER_STATUS,
          DICTS_IS_3C,
          DICTS_ORDER_TYPE,
          DICTS_CUSTOMS_ELEMENT_BRAND_TYPE,
          DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT
        } = constant
        Promise.all([
          getDataDictionary([
            DICTS_WHETHER_STATUS,
            DICTS_IS_3C,
            DICTS_ORDER_TYPE,
            DICTS_CUSTOMS_ELEMENT_BRAND_TYPE,
            DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT
          ]),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_ORDER_CLASSIFIED),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') &&
            (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
              ? getOrderImportDetailDeclarById(rowId)
              : getOrderExportDetailDeclarById(rowId))
        ]).then(([dicts, defaultConfig, info]) => {
          this.dicts = dicts
          this.defaultConfig = defaultConfig.data || {}
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            const {
              customerName,
              orderNo,
              productName,
              productModel,
              productBrand,
              productOrigin,
              productUnit,
              controlFlag,
              exemptionLevy,
              exemptionTariff,
              controlLicenseNo,
              declareRemark,
              cccFlag,
              cccNo,
              ciqCode,
              ciqName,
              orderDetailDeclarElementVOList
            } = info.data
            Object.assign(
              this.form,
              {
                classifyElements: orderDetailDeclarElementVOList
              },
              info.data
            )
            Object.assign(this.blurbForm, {
              customerName,
              orderNo,
              productName,
              productModel,
              productBrand,
              productOrigin,
              productUnit,
              controlFlag,
              exemptionLevy,
              exemptionTariff,
              controlLicenseNo,
              declareRemark,
              cccFlag: cccFlag || enums.IS_3C.getFieldByKey('NO'),
              cccNo,
              ciqCode,
              ciqName
            })
            this.generateClassifyElements(clone(this.form.classifyElements, true) || []).then(classifyElements => {
              this.form.classifyElements = classifyElements
              this.handleClassifyElementSplice()
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
    async handleCustomsCodeSelect(rows) {
      const { id } = rows[0]
      const res = await getBaseCustomsCodeById(id)
      const { data, code } = res
      if (code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        this.form.classifyElements = []
        Object.assign(this.form, data, { customsCodeName: data.productName, id: this.form.id })
        const classifyElements = await this.generateClassifyElements(data.baseCustomsCodeElementVOList || [])
        this.form.classifyElements = classifyElements
        this.handleClassifyElementSplice()
        Object.assign(this.blurbForm, {
          ciqCode: '',
          ciqName: ''
        })
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
    handleSave(declareStatus) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getBlurbFormInstance().validate(async (blurbFormValid, blurbFormMsgs) => {
            if (blurbFormValid) {
              this.saveLoading = true
              if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
                const { id, customsCode, customsName, customsCodeName, classifyElements } = this.form
                const {
                  productBrand,
                  productModel,
                  cccNo,
                  productUnit,
                  controlFlag,
                  exemptionLevy,
                  exemptionTariff,
                  controlLicenseNo,
                  cccFlag,
                  ciqCode,
                  ciqName,
                  remark
                } = this.blurbForm
                const formData = {
                  id,
                  declareStatus,
                  customsCode,
                  customsName,
                  customsCodeName,
                  productBrand,
                  productModel,
                  productUnit,
                  controlFlag,
                  exemptionLevy,
                  exemptionTariff,
                  controlLicenseNo,
                  cccNo,
                  cccFlag,
                  ciqCode,
                  ciqName,
                  orderDetailDeclarElementDTOList: classifyElements || [],
                  remark
                }
                try {
                  if (this.isBatchClassify) {
                    formData.ids = this.batchClassifyRows.map(row => row.id)
                    if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
                      await batchDeclareCustomsDeclartOrderImpor(formData)
                    } else {
                      await batchDeclareCustomsDeclartOrderExport(formData)
                    }
                  } else {
                    if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
                      await updateOrderImportDetailDeclar(formData)
                    } else {
                      await updateOrderExportDetailDeclar(formData)
                    }
                  }

                  if (!declareStatus) {
                    this.$message.success('暂存成功')
                  } else {
                    this.$message.success('归类成功')
                  }
                  this.visible = false
                  this.saveLoading = false
                  this.reLoad(true)
                } catch (error) {
                  this.saveLoading = false
                }
              }
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
    :visible.sync="visible"
    width="99%"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    :show-save="false"
  >
    <base-row>
      <base-col :span="5" style="padding-right: 10px">
        <base-form ref="blurbFormRef" :model="blurbForm" label-suffix=":" label-width="80px" size="mini">
          <base-row>
            <base-col v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')" :span="24">
              <base-form-item label="订单编号" prop="orderNo">
                <base-input v-model="blurbForm.orderNo" disabled />
              </base-form-item>
            </base-col>

            <base-col v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')" :span="24">
              <base-form-item label="客户名称" prop="customerName">
                <base-input v-model="blurbForm.customerName" disabled />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="品名" prop="productName">
                <base-input v-model="blurbForm.productName" disabled />
              </base-form-item>
            </base-col>

            <base-col v-if="!isBatchClassify" :span="24">
              <base-form-item label="型号" prop="productModel">
                <base-input v-model="blurbForm.productModel" disabled />
              </base-form-item>
            </base-col>

            <base-col v-if="!isBatchClassify" :span="24">
              <base-form-item label="品牌" prop="productBrand">
                <base-input v-model="blurbForm.productBrand" disabled />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="产地" prop="productOrigin">
                <base-input v-model="blurbForm.productOrigin" disabled />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="单位" prop="productUnit">
                <base-input v-model="blurbForm.productUnit" disabled />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="是否需要3C" prop="cccFlag">
                <base-select
                  v-model="blurbForm.cccFlag"
                  :clearable="false"
                  :options="dicts[constant.DICTS_IS_3C]"
                  @change="handleCccFlagChange"
                />
              </base-form-item>
            </base-col>

            <base-col v-if="blurbForm.cccFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="24">
              <base-form-item label="3C认证编号" prop="cccNo">
                <base-input v-model="blurbForm.cccNo" placeholder="请输入3C认证编号" />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="是否管制品" prop="controlFlag">
                <base-select
                  v-model="blurbForm.controlFlag"
                  :clearable="false"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                  @change="handleControlFlagChange"
                />
              </base-form-item>
            </base-col>

            <base-col v-if="blurbForm.controlFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="24">
              <base-form-item label="管制品许可证号" prop="controlLicenseNo">
                <base-input v-model="blurbForm.controlLicenseNo" placeholder="请输入管制品许可证号" />
              </base-form-item>
            </base-col>

            <base-col v-if="orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')" :span="24">
              <base-form-item label="减免加征" prop="exemptionLevy">
                <base-select v-model="blurbForm.exemptionLevy" :clearable="false" :options="dicts[constant.DICTS_WHETHER_STATUS]" />
              </base-form-item>
            </base-col>

            <base-col v-if="orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')" :span="24">
              <base-form-item label="减免关税" prop="exemptionTariff">
                <base-select v-model="blurbForm.exemptionTariff" :clearable="false" :options="dicts[constant.DICTS_WHETHER_STATUS]" />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="CIQ代码" prop="ciqCode">
                <business-autocomplete-basic
                  v-model="blurbForm.ciqCode"
                  label="CIQ代码"
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
                <base-input v-model="blurbForm.ciqName" placeholder="请输入CIQ名称" />
              </base-form-item>
            </base-col>

            <base-col v-if="!isBatchClassify" :span="24">
              <base-form-item label="客户申报要素" prop="declareRemark">
                <base-input
                  v-model="blurbForm.declareRemark"
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 8 }"
                  disabled
                  placeholder="请输入备注"
                />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="备注" prop="remark">
                <base-input v-model="blurbForm.remark" type="textarea" disabled placeholder="请输入备注" />
              </base-form-item>
            </base-col>
          </base-row>
        </base-form>

        <div v-if="isBatchClassify">
          <base-edit-table
            ref="tableRef"
            height="200px"
            :show-added="false"
            :show-delete="false"
            :show-checkbox="false"
            :name="
              orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
                ? constant.TABLE_NAME_CLASSIFY_BILL_IMPORT_CLASSIFY_BATCH
                : constant.TABLE_NAME_CLASSIFY_BILL_EXPORT_CLASSIFY_BATCH
            "
          />
        </div>
      </base-col>
      <base-col :span="19">
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
                        label="报关名称"
                        placeholder="请输入报关名称"
                        :is-exist="false"
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
                                    :disabled="item.disabled"
                                    @change="handleClassifyElementSplice"
                                  />
                                  <base-input
                                    v-else
                                    v-model="item.elementValue"
                                    type="textarea"
                                    :disabled="item.disabled"
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
                  <div class="content">{{ form.addTariffRate }}</div>
                </td>
              </tr>
              <!-- 关税率/退税率 -->
              <tr>
                <td class="label">
                  <div class="content">(出口)关税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.exRate) }}</div>
                </td>
                <td class="label">
                  <div class="content">(出口)退税率(%)</div>
                </td>
                <td>
                  <div class="content">{{ convertTaxRate(form.exRebateRate) }}</div>
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
            </tbody>
          </table>
        </base-form>
      </base-col>
    </base-row>
    <template #footer>
      <el-button type="primary" size="mini" :loading="saveLoading" @click="handleSave(0)">暂存</el-button>
      <el-button type="success" size="mini" :loading="saveLoading" @click="handleSave(1)">确认归类</el-button>
    </template>
  </base-dialog>
</template>

<style lang="scss" scoped>
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
      ::v-deep .el-form-item--mini.el-form-item {
        margin-bottom: 0;
      }
    }
  }
}
</style>

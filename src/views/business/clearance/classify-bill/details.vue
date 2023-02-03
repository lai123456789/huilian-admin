<script>
import { getOrderImportDetailDeclarById } from '@/api/order/order-import-detail-declar'
import { getOrderExportDetailDeclarById } from '@/api/order/order-export-detail-declar'
import { getProductBrandByBrandName } from '@/api/product/product-brand'
import { getDataDictionary } from '@/api/admin/dicts'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import constant from '@/constant'
import enums from '@/enums'
import config from '@/config'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { isFunction, clone } from 'xe-utils'
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

export default {
  name: 'Details',
  components: { EnterForm },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    orderType: String,
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      constant,
      enums,
      loading: false,
      form: {
        id: 0,
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
      },
      blurbForm: {
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
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      statusForm: {
        declareStatus: ''
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      showBtns: {
        edit: false
      },
      dicts: {},
      rightLabelWidth: '70px'
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.loading = true
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
        this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
          ? getOrderImportDetailDeclarById(this.tableRow.id)
          : getOrderExportDetailDeclarById(this.tableRow.id)
      ]).then(([dicts, defaultConfig, info]) => {
        this.dicts = dicts
        this.defaultConfig = defaultConfig.data || {}
        const {
          declareStatus,
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
          orderDetailDeclarElementVOList,
          createByName,
          createTime,
          remark
        } = info.data

        this.createForm = {
          createByName,
          createTime
        }

        this.statusForm = {
          declareStatus
        }

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
          ciqName,
          remark
        })
        this.generateClassifyElements(clone(this.form.classifyElements, true) || []).then(classifyElements => {
          this.form.classifyElements = classifyElements
          this.handleClassifyElementSplice()

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_WARE_RECEIVE_EDIT]
          }

          if (isFunction(cb)) cb()
          this.loading = false
        })
      })
    },
    handleClassifyElementsOptions(elementValue, elementName, type) {
      let str = elementValue
      if (type === 'select') {
        const target = this.dicts[ENUM[elementName].items].find(v => v.value === elementValue)
        str = target ? target.label : elementValue
      }
      return str
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
    async assignProductBrand(elementValue, classifyElements) {
      const productBrand = elementValue || this.blurbForm.productBrand
      if (productBrand) {
        const productBrandNothing = config.productModelNothings
        if (productBrandNothing.includes(productBrand)) {
          this.productBrandNameZhEn = config.defaultProductBrandEmpty
          this.handleAgainAssign(classifyElements, '')
        } else {
          if (!elementValue) {
            const res = await getProductBrandByBrandName({ name: this.blurbForm.productBrand })
            // 如果为空时，productBrandNameZhEn = defaultProductBrandEmpty 和 productBrandType = ''
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
    convertTaxRate(num) {
      return `${new BigNumber(Number(num)).times(100)}%`
    },
    handleEdit() {
      this.enterForm.visible = true
    },
    // 修改某一项时，刷新列表页和详情页
    handleUpdateInfoReload() {
      this.getDetailsData()
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate classify-bill"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-main">
          <base-row>
            <base-col :span="6" style="padding-right: 10px">
              <base-form ref="blurbFormRef" :model="blurbForm" label-suffix=":" label-width="80px" size="mini">
                <base-row>
                  <base-col :span="24">
                    <base-form-item label="订单编号" prop="orderNo">
                      <base-input v-model="blurbForm.orderNo" disabled />
                    </base-form-item>
                  </base-col>

                  <base-col :span="24">
                    <base-form-item label="客户名称" prop="customerName">
                      <base-input v-model="blurbForm.customerName" disabled />
                    </base-form-item>
                  </base-col>

                  <base-col :span="24">
                    <base-form-item label="品名" prop="productName">
                      <base-input v-model="blurbForm.productName" disabled />
                    </base-form-item>
                  </base-col>

                  <base-col :span="24">
                    <base-form-item label="型号" prop="productModel">
                      <base-input v-model="blurbForm.productModel" disabled />
                    </base-form-item>
                  </base-col>

                  <base-col :span="24">
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
                      <base-select v-model="blurbForm.cccFlag" disabled :clearable="false" :options="dicts[constant.DICTS_IS_3C]" />
                    </base-form-item>
                  </base-col>

                  <base-col v-if="blurbForm.cccFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="24">
                    <base-form-item label="3C认证编号" prop="cccNo">
                      <base-input v-model="blurbForm.cccNo" disabled placeholder="请输入3C认证编号" />
                    </base-form-item>
                  </base-col>

                  <base-col :span="24">
                    <base-form-item label="是否管制品" prop="controlFlag">
                      <base-select
                        v-model="blurbForm.controlFlag"
                        :clearable="false"
                        disabled
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col v-if="blurbForm.controlFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="24">
                    <base-form-item label="管制品许可证号" prop="controlLicenseNo">
                      <base-input v-model="blurbForm.controlLicenseNo" disabled placeholder="请输入管制品许可证号" />
                    </base-form-item>
                  </base-col>

                  <base-col v-if="orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')" :span="24">
                    <base-form-item label="减免加征" prop="exemptionLevy">
                      <base-select
                        v-model="blurbForm.exemptionLevy"
                        disabled
                        :clearable="false"
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col v-if="orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')" :span="24">
                    <base-form-item label="减免关税" prop="exemptionTariff">
                      <base-select
                        v-model="blurbForm.exemptionTariff"
                        disabled
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
                        disabled
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
                      <base-input v-model="blurbForm.ciqName" disabled placeholder="请输入CIQ名称" />
                    </base-form-item>
                  </base-col>

                  <base-col :span="24">
                    <base-form-item label="客户申报要素" prop="declareRemark">
                      <base-input v-model="blurbForm.declareRemark" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" disabled />
                    </base-form-item>
                  </base-col>

                  <base-col :span="24">
                    <base-form-item label="备注" prop="remark">
                      <base-input v-model="blurbForm.remark" type="textarea" disabled placeholder="请输入备注" />
                    </base-form-item>
                  </base-col>
                </base-row>
              </base-form>
            </base-col>
            <base-col :span="18">
              <base-form ref="formRef" :model="form" size="mini">
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
                            {{ form.customsCode }}
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
                            {{ form.customsName }}
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
                                      <div>{{ handleClassifyElementsOptions(item.elementValue, item.elementName, item.type) }}</div>
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
        </div>
      </div>
      <div class="common-operate-r">
        <el-divider content-position="left">状态</el-divider>

        <div class="common-operate-r-item">
          <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">归类状态:</div>
          <div class="dcommon-etails-r-value" :style="{ color: enums.DECLARE_STATUS.getFieldByValue(statusForm.declareStatus, 'color') }">
            {{ enums.DECLARE_STATUS.getFieldByValue(statusForm.declareStatus) }}
          </div>
        </div>

        <div class="common-operate-r-block">
          <el-divider content-position="left">创建信息</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">创建人:</div>
            <div class="dcommon-etails-r-value">{{ createForm.createByName }}</div>
          </div>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">创建时间:</div>
            <div class="common-operate-r-value">{{ createForm.createTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-operate-b">
      <div class="common-operate-b-wrap">
        <el-button
          v-if="showBtns.edit && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-edit"
          type="warning"
          @click="handleEdit"
          >编辑</el-button
        >
      </div>
    </div>
    <enter-form
      v-model="enterForm.visible"
      :type="enterForm.type"
      :order-type="orderType"
      :table-row="{ id: tableRow.id }"
      :re-load="handleUpdateInfoReload"
    />
  </div>
</template>

<style lang="scss" scoped>
.classify-bill {
  .common-operate-l {
    display: inline-block;
    overflow: inherit;
    width: calc(100% - 240px);
    &-main {
      overflow: auto;
      padding: 10px;
      height: 100%;
      box-sizing: border-box;
    }
  }
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
}
</style>

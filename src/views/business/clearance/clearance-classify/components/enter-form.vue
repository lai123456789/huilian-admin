<script>
import { getCustomsNameDeclarById, updateCustomsNameDeclar, saveCustomsNameDeclar } from '@/api/customs/customs-name-declar'
import { getBaseCustomsCodeById } from '@/api/base/base-customs-code'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
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
    // rules: { required: true, message: '品牌(中文或外文名称)必填' },
    disabled: false
  },
  型号: {
    valueKey: 'productModelName',
    // rules: { required: true, message: '型号必填' },
    disabled: false
  }
}

const form = {
  customsCode: '',
  customsName: '',
  remark: '',
  classifyElements: [],
  classifyElementInfo: '',
  customsCodeName: '',
  firstUnit: '',
  secondUnit: '',
  supervisionCondition: '',
  inspectionCategory: '',
  imTentativeRate: 0,
  addTariffRate: 0,
  preferentialRate: 0,
  imGeneralRate: 0,
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
    reLoad: {
      type: Function,
      default: () => () => {}
    }
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
        const { DICTS_CUSTOMS_ELEMENT_BRAND_TYPE, DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT } = constant
        Promise.all([
          getDataDictionary([DICTS_CUSTOMS_ELEMENT_BRAND_TYPE, DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCustomsNameDeclarById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            const { customsNameDeclarElementVOList } = info.data
            Object.assign(
              this.form,
              {
                classifyElements: customsNameDeclarElementVOList
              },
              info.data
            )

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
        Object.assign(this.form, data, { customsCodeName: data.productName, id: this.form.id })
        this.form.classifyElements = []
        const classifyElements = await this.generateClassifyElements(data.baseCustomsCodeElementVOList || [])
        this.form.classifyElements = classifyElements
        this.handleClassifyElementSplice()
      }
    },
    handleCustomsCodeClear() {
      this.form = Object.assign(this.form, clone(form, true))
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
    handleSave(declareStatus) {
      this.getFormInstance().validate(async (valid, invalidFields) => {
        if (valid) {
          this.saveLoading = true
          const { id, customsCode, customsName, classifyElements, remark } = this.form
          const formData = {
            id,
            customsCode,
            customsName,
            customsNameDeclarElementDTOList: classifyElements || [],
            remark
          }
          try {
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              await saveCustomsNameDeclar(formData)
            } else if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
              await updateCustomsNameDeclar(formData)
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
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          this.saveLoading = false
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
    width="99%"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    :show-save="false"
  >
    <base-row>
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
                      <base-input v-model="form.customsName" placeholder="请输入报关名称" />
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

              <!-- 归类备注 -->
              <tr>
                <td class="label">
                  <div class="content">归类备注</div>
                </td>
                <td colspan="3">
                  <div class="content">
                    <base-form-item prop="remark">
                      <base-input v-model="form.remark" type="textarea" placeholder="请输入归类备注" />
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

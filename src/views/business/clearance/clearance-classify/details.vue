<script>
import { getCustomsNameDeclarById } from '@/api/customs/customs-name-declar'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
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

export default {
  name: 'Details',
  components: { EnterForm },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    deleteFn: {
      type: Function,
      default: () => () => {}
    },
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
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      showBtns: {
        edit: false,
        del: false
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
      const { DICTS_CUSTOMS_ELEMENT_BRAND_TYPE, DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT } = constant
      Promise.all([
        getDataDictionary([DICTS_CUSTOMS_ELEMENT_BRAND_TYPE, DICTS_CUSTOMS_ELEMENT_EXPORT_BENEFIT]),
        getCustomsNameDeclarById(this.tableRow.id)
      ]).then(([dicts, info]) => {
        this.dicts = dicts
        const { customsNameDeclarElementVOList, createByName, createTime } = info.data

        this.createForm = {
          createByName,
          createTime
        }

        Object.assign(
          this.form,
          {
            classifyElements: customsNameDeclarElementVOList
          },
          info.data
        )

        this.generateClassifyElements(clone(this.form.classifyElements, true) || []).then((classifyElements) => {
          this.form.classifyElements = classifyElements
          this.handleClassifyElementSplice()

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_CLEAR_CLASSIFY_EDIT],
            del: this.permissions[constant.PERMISSION_CLEAR_CLASSIFY_DEL]
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
    handleDelete() {
      this.deleteFn()
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

                    <!-- 归类备注 -->
                    <tr>
                      <td class="label">
                        <div class="content">归类备注</div>
                      </td>
                      <td colspan="3">
                        <div class="content">
                          <base-form-item prop="remark">
                            {{ form.remark }}
                          </base-form-item>
                        </div>
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
          v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-delete"
          type="danger"
          @click="handleDelete"
          >删除</el-button
        >
        <el-button
          v-if="showBtns.edit && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-edit"
          type="warning"
          @click="handleEdit"
          >编辑</el-button
        >
      </div>
    </div>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
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

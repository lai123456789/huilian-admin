<script>
import { getBaseCustomsCodeById } from '@/api/base/base-customs-code'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'
import BigNumber from '@/utils/big-number'

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
    this.classifyElementsData = []
    this.ciqData = []
    return {
      constant,
      enums,
      loading: false,
      form: {
        id: 0,
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
      showPage: false,
      rightLabelWidth: '70px',
      classifyElements: {
        columns: [{ field: 'elementName', title: '申报要素' }],
        request: async () => {
          const data = this.classifyElementsData || []
          return {
            data,
            total: data.length
          }
        }
      },
      ciq: {
        columns: [
          { field: 'ciqCode', title: 'CIQ编码' },
          { field: 'ciqName', title: 'CIQ名称' }
        ],
        request: async () => {
          const data = this.ciqData || []
          return {
            data,
            total: data.length
          }
        }
      }
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
      this.$nextTick(() => {
        this.loading = true
        Promise.all([getDataDictionary([]), getBaseCustomsCodeById(this.tableRow.id)]).then(([dicts, info]) => {
          this.dicts = dicts
          const {
            createByName,
            createTime,
            vatRate,
            exciseRate,
            preferentialRate,
            exRate,
            exRebateRate,
            exTentativeRate,
            imGeneralRate,
            imTentativeRate,
            baseCustomsCodeElementVOList,
            baseCustomsCodeCiqVOList
          } = info.data

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

          this.createForm = {
            createByName,
            createTime
          }

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_BASE_HS_CODE_EDIT],
            del: this.permissions[constant.PERMISSION_BASE_HS_CODE_DEL]
          }

          this.classifyElementsData = baseCustomsCodeElementVOList
          this.ciqData = baseCustomsCodeCiqVOList

          if (isFunction(cb)) cb()
          this.showPage = true
          this.loading = false
        })
      })
    },

    handleEdit() {
      this.enterForm.visible = true
    },
    handleDelete() {
      this.deleteFn()
    },
    // 修改某一项时，刷新列表页和详情页
    handleUpdateInfoReload() {
      this.getDetailsData(() => {
        this.getClassifyElementsTableInstance().refresh(false)
        this.getCiqTableInstance().refresh(false)
      })
      this.reLoad(true)
    },
    getClassifyElementsTableInstance() {
      return this.$refs.detailsClassifyElementsRef
    },
    getCiqTableInstance() {
      return this.$refs.detailsCiqRef
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate hs-code is-details-adaptive"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-main">
          <base-form ref="formRef" :model="form" label-width="110px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="商品名称" prop="productName">
                    <base-input v-model="form.productName" disabled placeholder="请输入商品名称" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="商品编码" prop="productCode">
                    <base-input v-model="form.productCode" disabled placeholder="请输入商品编码" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="第一法定单位" prop="firstUnit">
                    <business-autocomplete-ccl
                      v-model="form.firstUnit"
                      disabled
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
                      disabled
                      label="第二法定单位"
                      placeholder="第二法定单位"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_UNIT"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="监管条件" prop="supervisionCondition">
                    <base-input v-model="form.supervisionCondition" disabled placeholder="请输入监管条件" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="检验检疫类别" prop="inspectionCategory">
                    <base-input v-model="form.inspectionCategory" disabled placeholder="请输入检验检疫类别" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="(进口)增值税率" prop="vatRate">
                    <base-input-number v-model="form.vatRate" disabled placeholder="请输入(进口)增值税率">
                      <template slot="append">%</template>
                    </base-input-number>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="(进口)消费税率" prop="exciseRate">
                    <base-input-number v-model="form.exciseRate" disabled placeholder="请输入(进口)消费税率">
                      <template slot="append">%</template>
                    </base-input-number>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="(进口)最惠国税率" prop="preferentialRate">
                    <base-input-number v-model="form.preferentialRate" disabled placeholder="请输入(进口)最惠国税率">
                      <template slot="append">%</template>
                    </base-input-number>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="(出口)关税率" prop="exRate">
                    <base-input-number v-model="form.exRate" disabled placeholder="请输入(出口)关税率">
                      <template slot="append">%</template>
                    </base-input-number>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="(出口)退税率" prop="exRebateRate">
                    <base-input-number v-model="form.exRebateRate" disabled placeholder="请输入(出口)退税率">
                      <template slot="append">%</template>
                    </base-input-number>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="(出口)暂定税率" prop="exTentativeRate">
                    <base-input-number v-model="form.exTentativeRate" disabled placeholder="请输入(出口)暂定税率">
                      <template slot="append">%</template>
                    </base-input-number>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="(进口)普通国税率" prop="imGeneralRate">
                    <base-input-number v-model="form.imGeneralRate" disabled placeholder="请输入(进口)普通国税率">
                      <template slot="append">%</template>
                    </base-input-number>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="(进口)暂定税率" prop="imTentativeRate">
                    <base-input-number v-model="form.imTentativeRate" disabled placeholder="请输入(进口)暂定税率">
                      <template slot="append">%</template>
                    </base-input-number>
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <div class="common-operate-block is-special">
              <div class="common-operate-block-item">
                <span class="common-operate-block-header">
                  <i class="icon el-icon-s-grid"></i>
                  商品申报要素信息
                </span>
                <div class="common-operate-block-body">
                  <base-page
                    v-if="showPage"
                    ref="detailsClassifyElementsRef"
                    :request="classifyElements.request"
                    :columns="classifyElements.columns"
                    :show-pager="false"
                    :tools-config="{
                      setting: {
                        visible: false
                      },
                      download: {
                        visible: false
                      },
                      refresh: {
                        visible: false
                      }
                    }"
                    :name="constant.TABLE_NAME_BASE_HS_CODE_CLASSIFY_ELEMENTS_DETAILS"
                  />
                </div>
              </div>
              <div class="common-operate-block-item">
                <span class="common-operate-block-header">
                  <i class="icon el-icon-s-grid"></i>
                  CIQ编码
                </span>
                <div class="common-operate-block-body">
                  <base-page
                    v-if="showPage"
                    ref="detailsCiqRef"
                    :request="ciq.request"
                    :columns="ciq.columns"
                    :show-pager="false"
                    :tools-config="{
                      setting: {
                        visible: false
                      },
                      download: {
                        visible: false
                      },
                      refresh: {
                        visible: false
                      }
                    }"
                    :name="constant.TABLE_NAME_BASE_HS_CODE_CIQ_DETAILS"
                  />
                </div>
              </div>
            </div>
          </base-form>
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
.hs-code {
  .common-operate-l {
    overflow: inherit;
    width: calc(100% - 240px);
    &-main {
      overflow: auto;
    }
  }
  .common-operate-block-body {
    min-height: 250px;
  }
  .common-operate-block {
    &-item {
      display: flex;
      width: 50%;
      height: 100%;
      flex-direction: column;
      &:last-child {
        ::v-deep .vxe-table {
          margin-left: 0;
        }
      }
    }
    &.is-special {
      flex-direction: row !important;
      .common-operate-block-header {
        margin-bottom: 0;
      }
    }
  }
}
</style>

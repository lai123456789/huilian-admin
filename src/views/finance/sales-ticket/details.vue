<script>
import { getAcctMakeInvoiceById, getAcctMakeInvoiceAuditList, auditAcctMakeInvoice } from '@/api/finance/acct-make-invoice'
import { updateAcctMakeInvoiceDetail } from '@/api/finance/acct-make-invoice-detail'
import { getAcctMakeInvoiceRelation } from '@/api/finance/acct-make-invoice-relation'
import { getAcctCostInvoice } from '@/api/finance/acct-cost-invoice'
import { getAcctMakeInvoiceDiffUse } from '@/api/finance/acct-make-invoice-diff-use'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterFormInputTax from './components/enter-form-input-tax'

export default {
  name: 'Details',
  components: { EnterFormInputTax },
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
        auditStatus: void 0,
        orderType: '',
        customerId: 0,
        companyId: 0,
        customerName: '',
        realInvoiceTitle: void 0,
        invoiceTitle: '',
        invoiceType: '',
        invoiceMakeType: enums.SERVICE_TAX_FLAG.getFieldByKey('VAT'),
        beforeFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
        rate: 0,
        bankName: '',
        bankNo: '',
        registerAddress: '',
        registerTel: '',
        allMoney: 0,
        diffMoney: 0,
        totalMoney: 0,
        cargoMoney: 0,
        taxMoney: 0,
        taxRate: '',
        creditCode: '',
        taxDate: '',
        taxCode: '',
        taxNo: '',
        remark: ''
      },
      enterFormInputTax: {
        visible: false,
        row: {}
      },
      createForm: {
        createByName: '',
        createTime: ''
      },

      enterFormConfirm: {
        visible: false,
        row: {}
      },
      showBtns: {
        del: false
      },
      verificationForm: {
        visible: false,
        params: {}
      },
      dicts: {},
      rightLabelWidth: '70px',
      goods: {
        columns: [],
        request: null
      },
      service: {
        columns: [],
        request: null
      },
      relevance: {
        columns: [],
        request: null
      },
      requestApi: {
        list: () => getAcctMakeInvoiceAuditList(this.tableRow.id),
        save: auditAcctMakeInvoice
      },
      showPage: false,
      showAuditDetailsBtn: false,
      activeName: '发票明细',
      dropdownButtonMoresOptions: []
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_SALES_TICKET_AUDIT]
    this.dropdownButtonMoresOptions = [
      {
        label: '录入税票信息',
        visible: this.permissions[constant.PERMISSION_SALES_TICKET_INPUT],
        handler: () => this.handleInputTaxInvoice()
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_TAX_RATE, DICTS_ORDER_TYPE, DICTS_WHETHER_STATUS, DICTS_INVOICE_TYPE, DICTS_SERVICE_TAX_FLAG } = constant
        Promise.all([
          getDataDictionary([DICTS_TAX_RATE, DICTS_ORDER_TYPE, DICTS_WHETHER_STATUS, DICTS_INVOICE_TYPE, DICTS_SERVICE_TAX_FLAG]),
          getAcctMakeInvoiceById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { acctMakeInvoiceDetailVOList, createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(this.form, info.data)

          this.showBtns = {
            del: this.permissions[constant.PERMISSION_SALES_TICKET_DEL]
          }

          this.$nextTick(() => {
            this.$refs.invoiceEditTableRef.loadColumns(this.handleColumns()[0])
            this.$refs.invoiceEditTableRef.loadData(acctMakeInvoiceDetailVOList || [], 'cover')

            this.goods = {
              columns: this.handleColumns()[1],
              request: async ({ pager, params }) => {
                const { data } = await getAcctMakeInvoiceRelation({
                  ...pager,
                  ...transforArrayPayload(Object.assign({ taxInvoiceId: this.tableRow.id }, params))
                })
                return {
                  data: data.records,
                  total: data.total
                }
              }
            }
            this.service = {
              columns: this.handleColumns()[2],
              request: async ({ pager, params }) => {
                const { data } = await getAcctCostInvoice({
                  ...pager,
                  ...transforArrayPayload(Object.assign({ makeInvoiceId: this.tableRow.id }, params))
                })
                return {
                  data: data.records,
                  total: data.total
                }
              }
            }
            this.relevance = {
              columns: this.handleColumns()[3],
              request: async ({ pager, params }) => {
                const { data } = await getAcctMakeInvoiceDiffUse({
                  ...pager,
                  ...transforArrayPayload(Object.assign({ makeInvoiceId: this.tableRow.id }, params))
                })
                return {
                  data: data.records,
                  total: data.total
                }
              }
            }

            if (cb) cb()
            this.showPage = true
            this.loading = false
          })
        })
      })
    },
    /** 明细列数据 */
    handleColumns() {
      return [
        // 发票明细
        [
          { field: 'productModel', width: 150, title: '型号' },
          { field: 'productName', width: 140, title: '品名' },
          { field: 'productUnit', width: 100, title: '单位' },
          { field: 'qty', width: 100, title: '数量' },
          {
            field: 'price',
            width: 130,
            title: '单价',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          {
            field: 'taxMoney',
            width: 100,
            title: '税额',
            formatter: {
              type: 'number'
            },
            sum: true
          },
          {
            field: 'cargoMoney',
            width: 100,
            title: '货款',
            formatter: {
              type: 'number'
            },
            sum: true
          },
          {
            field: 'totalMoney',
            width: 100,
            title: '本次开票金额',
            formatter: {
              type: 'number'
            },
            sum: true
          },
          {
            field: 'serviceName',
            title: '税收分类名称',
            width: 140,
            type: 'custom',
            customRender: (h, { row, column }) => {
              return (
                <business-autocomplete-basic
                  vModel={row[column.field]}
                  size="mini"
                  module-name={constant.AUTOCOMPLETE_KEY_TAX_CATEGORY}
                  label="税收分类名称"
                  auto-assign={{
                    codeNum: 'codeNum'
                  }}
                  form={row}
                  onClear={() => (row.codeNum = '')}
                />
              )
            }
          },
          { field: 'codeNum', width: 130, title: '税收分类编码', type: 'input' }
        ],
        //  商品明细
        [
          { field: 'orderNo', title: '订单编号' },
          { field: 'productModel', title: '型号' },
          { field: 'productName', title: '品名' },
          { field: 'productUnit', title: '单位' },
          { field: 'qty', title: '数量' },
          {
            field: 'price',
            title: '单价',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          {
            field: 'totalMoney',
            title: '本次开票金额',
            formatter: {
              type: 'number'
            },
            sum: true
          }
        ],
        // 服务费项目
        [
          { field: 'costNo', title: '应收编号' },
          {
            field: 'orderType',
            title: '订单类型',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
              }
            }
          },
          { field: 'orderNo', title: '订单编号' },
          {
            field: 'costType',
            title: '费用大类',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COST_TYPE)
              }
            }
          },
          { field: 'costName', title: '费用名称' },
          {
            field: 'settleMoney',
            title: '应收金额',
            sum: true,
            formatter: {
              type: 'number'
            }
          }
        ],
        // 关联票差
        [
          { field: 'invoiceDiffNo', title: '票差单号' },
          { field: 'deductDate', title: '抵扣日期' },
          {
            field: 'totalMoney',
            title: '抵扣票差金额',
            sum: true,
            formatter: {
              type: 'number'
            }
          }
        ]
      ]
    },
    handleTabClick({ name }) {
      if (name === '发票明细') {
        this.invoiceReload()
      } else if (name === '商品明细') {
        this.goodsReload(false)
      } else if (name === '服务费项目') {
        this.serviceReload(false)
      } else if (name === '关联票差') {
        this.relevanceReload(false)
      }
    },
    handleDelete() {
      this.deleteFn()
    },
    handleAuditSave(closeDialog) {
      this.handleUpdateInfoReload(() => {
        closeDialog()
      })
    },
    handleInputTaxInvoice() {
      const { taxCode, taxDate, taxNo } = this.form
      this.enterFormInputTax = {
        visible: true,
        row: {
          id: this.tableRow.id,
          taxCode,
          taxDate,
          taxNo
        }
      }
    },
    handleTaxCategorySave() {
      this.$refs.invoiceEditTableRef.validate(async valids => {
        if (valids) {
          const { rowIndex, rule } = valids
          return this.$message.error(`发票明细: 第${rowIndex + 1}行 ${rule.message}`)
        }
        const { id } = this.mainRow
        const records = this.$refs.invoiceEditTableRef.getRecords()
        const acctTaxInvoiceVerifyDTO = {
          taxInvoiceId: id,
          acctMakeInvoiceDetailUpdateDTOList: records.map(record => ({
            id: record.id,
            serviceName: record.serviceName,
            codeNum: record.codeNum
          }))
        }
        await updateAcctMakeInvoiceDetail(acctTaxInvoiceVerifyDTO)
        this.invoiceReload(() => {
          this.$message.success('操作成功')
        })
      })
    },
    invoiceReload(cb) {
      getAcctMakeInvoiceById(this.tableRow.id).then(res => {
        this.$refs.invoiceEditTableRef.loadData(res.data.acctMakeInvoiceDetailVOList || [], 'cover')
        if (cb) {
          cb()
        }
      })
    },
    goodsReload(isClearSelect) {
      this.$refs['goodsTableRef'].refresh(isClearSelect)
    },
    serviceReload(isClearSelect) {
      this.$refs['serviceTableRef'].refresh(isClearSelect)
    },
    relevanceReload(isClearSelect) {
      this.$refs['relevanceTableRef'].refresh(isClearSelect)
    },
    // 修改某一项时，刷新列表页和详情页
    handleUpdateInfoReload() {
      this.activeName = '发票明细'
      this.getDetailsData()
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate receipt is-details-adaptive"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-audit">
          <business-audit-bar
            ref="auditBarRef"
            :audit-status="form.auditStatus"
            :business-id="tableRow.id"
            :request-api="requestApi"
            :show-details="showAuditDetailsBtn"
            @save="handleAuditSave"
          ></business-audit-bar>
        </div>
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
                  <base-form-item label="客户名称" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      disabled
                      label="客户名称"
                      placeholder="请输入客户名称"
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="发票类型" prop="invoiceMakeType">
                    <base-select
                      v-model="form.invoiceMakeType"
                      disabled
                      placeholder="请选择发票类型"
                      :options="dicts[constant.DICTS_SERVICE_TAX_FLAG]"
                      :clearable="false"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="发票抬头" prop="invoiceTitle">
                    <business-autocomplete-basic
                      v-model="form.invoiceTitle"
                      disabled
                      label="发票抬头"
                      placeholder="请输入发票抬头"
                      :module-name="constant.AUTOCOMPLETE_KEY_CUS_MAKE_INVOICE"
                      :params="{
                        companyId: form.companyId
                      }"
                      :auto-assign="{
                        invoiceType: 'invoiceType',
                        bankName: 'bankName',
                        bankNo: 'bankNo',
                        registerAddress: 'registerAddress',
                        registerTel: 'registerTel',
                        creditCode: 'creditCode'
                      }"
                      :form="form"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="纳税识别号" prop="creditCode">
                    <base-input v-model="form.creditCode" disabled placeholder="请输入纳税识别号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="发票开具类型" prop="invoiceType">
                    <base-select
                      v-model="form.invoiceType"
                      disabled
                      placeholder="请选择发票开具类型"
                      :options="dicts[constant.DICTS_INVOICE_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    label="开户银行名称"
                    prop="bankName"
                    :rules="[
                      {
                        required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
                        message: '开户银行名称必填'
                      }
                    ]"
                  >
                    <base-input v-model="form.bankName" disabled placeholder="请输入开户银行名称" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    label="开户银行账号"
                    prop="bankNo"
                    :rules="[
                      {
                        required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
                        message: '开户银行名称必填'
                      }
                    ]"
                  >
                    <base-input v-model="form.bankNo" disabled placeholder="请输入开户银行账号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    label="注册场所地址"
                    prop="registerAddress"
                    :rules="[
                      {
                        required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
                        message: '注册场所地址必填'
                      }
                    ]"
                  >
                    <base-input v-model="form.registerAddress" disabled placeholder="请输入注册场所地址" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    label="注册固定电话"
                    prop="registerTel"
                    :rules="[
                      {
                        required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
                        message: '注册固定电话必填'
                      }
                    ]"
                  >
                    <base-input v-model="form.registerTel" disabled placeholder="请输入注册固定电话" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="税率" prop="taxRate">
                    <base-select v-model="form.taxRate" placeholder="请选择税率" disabled :options="dicts[constant.DICTS_TAX_RATE]" />
                  </base-form-item>
                </base-col>

                <template v-if="form.invoiceMakeType === enums.INVOICE_TYPE.getFieldByKey('VAT_INVOICE')">
                  <base-col :span="6">
                    <base-form-item label="是否提前开票" prop="beforeFlag">
                      <base-select
                        v-model="form.beforeFlag"
                        placeholder="请选择是否提前开票"
                        disabled
                        :clearable="false"
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col v-if="form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="6">
                    <base-form-item label="提前开票汇率" prop="rate">
                      <base-input-number v-model="form.rate" disabled :precision="6" placeholder="请输入提前开票汇率" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col v-if="form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')" :span="6">
                  <base-form-item label="票差金额" prop="diffMoney">
                    <base-input-number v-model="form.diffMoney" disabled :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="开票总金额" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="货款" prop="cargoMoney">
                    <base-input-number v-model="form.cargoMoney" disabled :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="税额" prop="taxMoney">
                    <base-input-number v-model="form.taxMoney" disabled :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="发票代码" prop="taxCode">
                    <base-input v-model="form.taxCode" disabled placeholder="请输入发票代码" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="发票号码" prop="taxNo">
                    <base-input v-model="form.taxNo" disabled placeholder="请输入发票号码" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="开票日期" prop="taxDate">
                    <base-date-picker v-model="form.taxDate" disabled placeholder="选择开票日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="发票备注" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="请输入发票备注" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <div class="common-operate-block">
              <el-tabs v-model="activeName" type="card" class="common-compact-tabs" @tab-click="handleTabClick">
                <el-tab-pane label="发票明细" name="发票明细">
                  <base-edit-table
                    ref="invoiceEditTableRef"
                    :show-added="false"
                    :show-delete="false"
                    :name="constant.TABLE_NAME_SALES_TICKET_INVOICE_DETAILS"
                  >
                    <template v-slot:buttons>
                      <el-button size="mini" type="warning" :disabled="false" @click="handleTaxCategorySave">修改税收分类</el-button>
                    </template>
                  </base-edit-table>
                </el-tab-pane>
                <el-tab-pane label="商品明细" name="商品明细">
                  <base-page
                    v-if="showPage"
                    ref="goodsTableRef"
                    :request="goods.request"
                    :columns="goods.columns"
                    :tools-config="{
                      setting: {
                        visible: false
                      },
                      download: {
                        visible: false
                      }
                    }"
                    show-footer
                    :name="constant.TABLE_NAME_SALES_TICKET_GOODS_DETAILS"
                  />
                </el-tab-pane>
                <el-tab-pane label="服务费项目" name="服务费项目">
                  <base-page
                    v-if="showPage"
                    ref="serviceTableRef"
                    :request="service.request"
                    :columns="service.columns"
                    :tools-config="{
                      setting: {
                        visible: false
                      },
                      download: {
                        visible: false
                      }
                    }"
                    show-footer
                    :name="constant.TABLE_NAME_SALES_TICKET_SERVICE_DETAILS"
                  />
                </el-tab-pane>
                <el-tab-pane label="关联票差" name="关联票差">
                  <base-page
                    v-if="showPage"
                    ref="relevanceTableRef"
                    :request="relevance.request"
                    :columns="relevance.columns"
                    :tools-config="{
                      setting: {
                        visible: false
                      },
                      download: {
                        visible: false
                      }
                    }"
                    show-footer
                    :name="constant.TABLE_NAME_SALES_TICKET_DIFF_VOT_DETAILS"
                  />
                </el-tab-pane>
              </el-tabs>
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
        <business-dropdown-button :options="dropdownButtonMoresOptions">更多操作</business-dropdown-button>
        <el-button
          v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-delete"
          type="danger"
          @click="handleDelete"
          >删除</el-button
        >
      </div>
    </div>
    <enter-form-input-tax
      ref="enterFormInputTaxRef"
      v-model="enterFormInputTax.visible"
      :table-row="enterFormInputTax.row"
      :re-load="handleUpdateInfoReload"
    />
  </div>
</template>

<style lang="scss" scoped>
.receipt {
  .common-operate-l {
    overflow: inherit;
    width: calc(100% - 240px);
    &-audit {
      padding: 10px 10px 0 10px;
    }
    &-main {
      overflow: auto;
    }
  }
  .common-operate-block-body {
    min-height: 250px;
  }
  .common-operate-block {
    &.is-special {
      .common-operate-block-header {
        margin-bottom: 0;
      }
    }
    &:last-child {
      min-height: 400px;
    }
  }
  .common-compact-tabs {
    ::v-deep .base-page-toolbar {
      padding-top: 0;
    }
    ::v-deep .base-page-footer {
      padding-bottom: 0;
    }
  }
}
</style>

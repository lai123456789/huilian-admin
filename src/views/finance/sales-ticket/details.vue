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
      activeName: '????????????',
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
        label: '??????????????????',
        visible: this.permissions[constant.PERMISSION_SALES_TICKET_INPUT],
        handler: () => this.handleInputTaxInvoice()
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
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
    /** ??????????????? */
    handleColumns() {
      return [
        // ????????????
        [
          { field: 'productModel', width: 150, title: '??????' },
          { field: 'productName', width: 140, title: '??????' },
          { field: 'productUnit', width: 100, title: '??????' },
          { field: 'qty', width: 100, title: '??????' },
          {
            field: 'price',
            width: 130,
            title: '??????',
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
            title: '??????',
            formatter: {
              type: 'number'
            },
            sum: true
          },
          {
            field: 'cargoMoney',
            width: 100,
            title: '??????',
            formatter: {
              type: 'number'
            },
            sum: true
          },
          {
            field: 'totalMoney',
            width: 100,
            title: '??????????????????',
            formatter: {
              type: 'number'
            },
            sum: true
          },
          {
            field: 'serviceName',
            title: '??????????????????',
            width: 140,
            type: 'custom',
            customRender: (h, { row, column }) => {
              return (
                <business-autocomplete-basic
                  vModel={row[column.field]}
                  size="mini"
                  module-name={constant.AUTOCOMPLETE_KEY_TAX_CATEGORY}
                  label="??????????????????"
                  auto-assign={{
                    codeNum: 'codeNum'
                  }}
                  form={row}
                  onClear={() => (row.codeNum = '')}
                />
              )
            }
          },
          { field: 'codeNum', width: 130, title: '??????????????????', type: 'input' }
        ],
        //  ????????????
        [
          { field: 'orderNo', title: '????????????' },
          { field: 'productModel', title: '??????' },
          { field: 'productName', title: '??????' },
          { field: 'productUnit', title: '??????' },
          { field: 'qty', title: '??????' },
          {
            field: 'price',
            title: '??????',
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
            title: '??????????????????',
            formatter: {
              type: 'number'
            },
            sum: true
          }
        ],
        // ???????????????
        [
          { field: 'costNo', title: '????????????' },
          {
            field: 'orderType',
            title: '????????????',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
              }
            }
          },
          { field: 'orderNo', title: '????????????' },
          {
            field: 'costType',
            title: '????????????',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COST_TYPE)
              }
            }
          },
          { field: 'costName', title: '????????????' },
          {
            field: 'settleMoney',
            title: '????????????',
            sum: true,
            formatter: {
              type: 'number'
            }
          }
        ],
        // ????????????
        [
          { field: 'invoiceDiffNo', title: '????????????' },
          { field: 'deductDate', title: '????????????' },
          {
            field: 'totalMoney',
            title: '??????????????????',
            sum: true,
            formatter: {
              type: 'number'
            }
          }
        ]
      ]
    },
    handleTabClick({ name }) {
      if (name === '????????????') {
        this.invoiceReload()
      } else if (name === '????????????') {
        this.goodsReload(false)
      } else if (name === '???????????????') {
        this.serviceReload(false)
      } else if (name === '????????????') {
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
          return this.$message.error(`????????????: ???${rowIndex + 1}??? ${rule.message}`)
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
          this.$message.success('????????????')
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
    // ????????????????????????????????????????????????
    handleUpdateInfoReload() {
      this.activeName = '????????????'
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
    element-loading-text="???????????????"
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
            <!-- ???????????? -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="????????????" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      disabled
                      label="????????????"
                      placeholder="?????????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="invoiceMakeType">
                    <base-select
                      v-model="form.invoiceMakeType"
                      disabled
                      placeholder="?????????????????????"
                      :options="dicts[constant.DICTS_SERVICE_TAX_FLAG]"
                      :clearable="false"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="invoiceTitle">
                    <business-autocomplete-basic
                      v-model="form.invoiceTitle"
                      disabled
                      label="????????????"
                      placeholder="?????????????????????"
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
                  <base-form-item label="???????????????" prop="creditCode">
                    <base-input v-model="form.creditCode" disabled placeholder="????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????????????????" prop="invoiceType">
                    <base-select
                      v-model="form.invoiceType"
                      disabled
                      placeholder="???????????????????????????"
                      :options="dicts[constant.DICTS_INVOICE_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    label="??????????????????"
                    prop="bankName"
                    :rules="[
                      {
                        required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
                        message: '????????????????????????'
                      }
                    ]"
                  >
                    <base-input v-model="form.bankName" disabled placeholder="???????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    label="??????????????????"
                    prop="bankNo"
                    :rules="[
                      {
                        required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
                        message: '????????????????????????'
                      }
                    ]"
                  >
                    <base-input v-model="form.bankNo" disabled placeholder="???????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    label="??????????????????"
                    prop="registerAddress"
                    :rules="[
                      {
                        required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
                        message: '????????????????????????'
                      }
                    ]"
                  >
                    <base-input v-model="form.registerAddress" disabled placeholder="???????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    label="??????????????????"
                    prop="registerTel"
                    :rules="[
                      {
                        required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'),
                        message: '????????????????????????'
                      }
                    ]"
                  >
                    <base-input v-model="form.registerTel" disabled placeholder="???????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="taxRate">
                    <base-select v-model="form.taxRate" placeholder="???????????????" disabled :options="dicts[constant.DICTS_TAX_RATE]" />
                  </base-form-item>
                </base-col>

                <template v-if="form.invoiceMakeType === enums.INVOICE_TYPE.getFieldByKey('VAT_INVOICE')">
                  <base-col :span="6">
                    <base-form-item label="??????????????????" prop="beforeFlag">
                      <base-select
                        v-model="form.beforeFlag"
                        placeholder="???????????????????????????"
                        disabled
                        :clearable="false"
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col v-if="form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="6">
                    <base-form-item label="??????????????????" prop="rate">
                      <base-input-number v-model="form.rate" disabled :precision="6" placeholder="???????????????????????????" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col v-if="form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')" :span="6">
                  <base-form-item label="????????????" prop="diffMoney">
                    <base-input-number v-model="form.diffMoney" disabled :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="cargoMoney">
                    <base-input-number v-model="form.cargoMoney" disabled :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="taxMoney">
                    <base-input-number v-model="form.taxMoney" disabled :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="taxCode">
                    <base-input v-model="form.taxCode" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="taxNo">
                    <base-input v-model="form.taxNo" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="taxDate">
                    <base-date-picker v-model="form.taxDate" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="????????????" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <div class="common-operate-block">
              <el-tabs v-model="activeName" type="card" class="common-compact-tabs" @tab-click="handleTabClick">
                <el-tab-pane label="????????????" name="????????????">
                  <base-edit-table
                    ref="invoiceEditTableRef"
                    :show-added="false"
                    :show-delete="false"
                    :name="constant.TABLE_NAME_SALES_TICKET_INVOICE_DETAILS"
                  >
                    <template v-slot:buttons>
                      <el-button size="mini" type="warning" :disabled="false" @click="handleTaxCategorySave">??????????????????</el-button>
                    </template>
                  </base-edit-table>
                </el-tab-pane>
                <el-tab-pane label="????????????" name="????????????">
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
                <el-tab-pane label="???????????????" name="???????????????">
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
                <el-tab-pane label="????????????" name="????????????">
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
          <el-divider content-position="left">????????????</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">?????????:</div>
            <div class="dcommon-etails-r-value">{{ createForm.createByName }}</div>
          </div>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div class="common-operate-r-value">{{ createForm.createTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-operate-b">
      <div class="common-operate-b-wrap">
        <business-dropdown-button :options="dropdownButtonMoresOptions">????????????</business-dropdown-button>
        <el-button
          v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-delete"
          type="danger"
          @click="handleDelete"
          >??????</el-button
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

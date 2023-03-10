<script>
import { getAcctReceiveInvoiceById, getAcctReceiveInvoiceAuditList, auditAcctReceiveInvoice } from '@/api/finance/acct-receive-invoice'
import { getAcctReceiveInvoiceRelation } from '@/api/finance/acct-receive-invoice-relation'
import { removeAcctTaxRefundDeclaration } from '@/api/finance/acct-tax-refund-declaration'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import EnterFormCorresp from './components/enter-form-corresp'
import EnterFormTaxDeclare from './components/enter-form-tax-declare'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm, EnterFormCorresp, EnterFormTaxDeclare },
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
        serviceTaxFlag: enums.SERVICE_TAX_FLAG.getFieldByKey('VAT'),
        taxDate: '',
        supplierId: 0,
        supplierName: '',
        totalMoney: 0,
        taxRate: '',
        cargoMoney: 0,
        taxMoney: 0,
        taxCode: '',
        taxNo: '',
        remark: ''
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      corresp: {
        visible: false,
        row: {}
      },
      taxDeclare: {
        visible: false,
        row: {}
      },
      showBtns: {
        edit: false,
        del: false
      },
      dicts: {},
      orderTypes: [],
      rightLabelWidth: '70px',
      showPage: false,
      columns: [],
      request: null,
      requestApi: {
        list: () => getAcctReceiveInvoiceAuditList(this.tableRow.id),
        save: auditAcctReceiveInvoice
      },
      showAuditDetailsBtn: false,
      dropdownButtonMoresOptions: []
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_INPUT_TICKET_AUDIT]
    this.dropdownButtonMoresOptions = [
      {
        label: '??????????????????',
        visible: this.permissions[constant.PERMISSION_INPUT_TICKET_TAX_DECLARE],
        handler: this.handleAddTaxDeclare
      },
      {
        label: '??????????????????',
        visible: this.permissions[constant.PERMISSION_INPUT_TICKET_CORRESP],
        handler: this.handleCorresp
      },
      {
        label: '??????????????????',
        visible: this.permissions[constant.PERMISSION_INPUT_TICKET_TAX_UN_DECLARE],
        handler: this.handleRemoveTaxDeclare
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_ORDER_TYPE, DICTS_SERVICE_TAX_FLAG, DICTS_TAX_RATE } = constant
        Promise.all([
          getDataDictionary([DICTS_ORDER_TYPE, DICTS_SERVICE_TAX_FLAG, DICTS_TAX_RATE]),
          getAcctReceiveInvoiceById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { createByName, createTime } = info.data
          this.dicts = dicts
          this.orderTypes = this.dicts[DICTS_ORDER_TYPE].filter(v => v.value === enums.ORDER_TYPE.getFieldByKey('EXPORT'))

          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(this.form, info.data, {
            taxRate: String(info.data.taxRate)
          })

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_INPUT_TICKET_EDIT],
            del: this.permissions[constant.PERMISSION_INPUT_TICKET_DEL]
          }

          this.$nextTick(() => {
            if (this.form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('SERVICE')) {
              this.columns = this.handleColumns()[1]
              this.request = async ({ pager, params }) => {
                const { data } = await getAcctReceiveInvoiceRelation({
                  ...pager,
                  ...transforArrayPayload(Object.assign({ taxInvoiceId: this.tableRow.id }, params))
                })
                return {
                  data: data.records,
                  total: data.total
                }
              }
              if (isFunction(cb)) cb()
              this.showPage = true
              this.loading = false
            } else if (this.form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')) {
              this.columns = this.handleColumns()[0]
              this.request = async ({ pager, params }) => {
                const { data } = await getAcctReceiveInvoiceRelation({
                  ...pager,
                  ...transforArrayPayload(Object.assign({ taxInvoiceId: this.tableRow.id }, params))
                })
                return {
                  data: data.records,
                  total: data.total
                }
              }
              if (isFunction(cb)) cb()
              this.showPage = true
              this.loading = false
            }
          })
        })
      })
    },
    /** ??????????????? */
    handleColumns() {
      return [
        // ????????????
        [
          { field: 'orderNo', title: '????????????' },
          { field: 'productModel', title: '??????' },
          { field: 'productName', title: '??????' },
          { field: 'receiveName', title: '????????????' },
          { field: 'productUnit', width: 100, title: '??????' },
          {
            field: 'qty',
            title: '??????????????????',
            sum: true,
            footerConfig: {
              precision: 6
            },
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            }
          },
          {
            field: 'price',
            title: '????????????',
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
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'cargoMoney',
            title: '??????',
            sum: true,
            formatter: {
              type: 'number'
            }
          },

          {
            field: 'taxMoney',
            title: '??????',
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          { field: 'serviceName', title: '??????????????????' },
          { field: 'codeNum', title: '??????????????????' },
          { field: 'remark', title: '??????' }
        ],
        // ????????????
        [
          { field: 'receiveName', title: '????????????' },
          { field: 'productUnit', title: '??????' },
          {
            field: 'totalMoney',
            title: '??????????????????',
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'cargoMoney',
            title: '??????',
            sum: true,
            formatter: {
              type: 'number'
            }
          },

          {
            field: 'taxMoney',
            title: '??????',
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          { field: 'serviceName', title: '??????????????????' },
          { field: 'codeNum', title: '??????????????????' }
        ]
      ]
    },
    handleAddTaxDeclare() {
      if (!(this.form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) return this.$message.error('???????????????????????????')
      this.taxDeclare = {
        visible: true,
        row: {
          taxInvoiceId: [this.tableRow.id]
        }
      }
    },
    handleCorresp() {
      this.corresp = {
        visible: true,
        row: {
          ids: this.tableRow.id,
          remark: this.form.remark
        }
      }
    },
    handleRemoveTaxDeclare() {
      this.$confirm('?????????????????????????')
        .then(() => {
          removeAcctTaxRefundDeclaration(this.tableRow.id).then(() => {
            this.handleUpdateInfoReload()
            this.$message.success('????????????')
          })
        })
        .catch(() => {})
    },
    handleEdit() {
      this.enterForm.visible = true
    },
    handleDelete() {
      this.deleteFn()
    },
    handleAuditSave(closeDialog) {
      this.handleUpdateInfoReload(() => {
        closeDialog()
      })
    },
    // ????????????????????????????????????????????????
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.$refs.tableDetailsRef.refresh(false)
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate receive-invoice is-details-adaptive"
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
                  <base-form-item label="????????????" prop="orderType">
                    <base-select v-model="form.orderType" placeholder="?????????????????????" disabled :options="orderTypes" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="serviceTaxFlag">
                    <base-select
                      v-model="form.serviceTaxFlag"
                      placeholder="?????????????????????"
                      disabled
                      :options="dicts[constant.DICTS_SERVICE_TAX_FLAG]"
                      :clearable="false"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="taxDate">
                    <base-date-picker v-model="form.taxDate" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="supplierName">
                    <business-autocomplete-basic
                      v-model="form.supplierName"
                      disabled
                      label="???????????????"
                      placeholder="????????????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_SUPPLIER"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled placeholder="????????????????????????" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="taxRate">
                    <base-select
                      v-model="form.taxRate"
                      placeholder="???????????????"
                      disabled
                      :clearable="false"
                      :options="dicts[constant.DICTS_TAX_RATE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="cargoMoney">
                    <base-input-number v-model="form.cargoMoney" disabled placeholder="???????????????" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="taxMoney">
                    <base-input-number v-model="form.taxMoney" disabled placeholder="???????????????" :precision="2" />
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
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="????????????" prop="remark" class="form-item-textarea">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!-- ????????????/???????????? -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                {{ form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') ? '????????????' : '????????????' }}
              </span>
              <div class="common-operate-block-body">
                <base-page
                  v-if="showPage"
                  ref="tableDetailsRef"
                  :request="request"
                  :columns="columns"
                  :tools-config="{
                    setting: {
                      visible: false
                    },
                    download: {
                      visible: false
                    }
                  }"
                  show-footer
                  :name="constant.TABLE_NAME_INPUT_TICKET_DETAILS"
                />
              </div>
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
        <el-button
          v-if="showBtns.edit && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-edit"
          type="warning"
          @click="handleEdit"
          >??????</el-button
        >
      </div>
    </div>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
    <enter-form-corresp v-model="corresp.visible" :table-row="corresp.row" :re-load="handleUpdateInfoReload"></enter-form-corresp>
    <enter-form-tax-declare
      v-model="taxDeclare.visible"
      :table-row="taxDeclare.row"
      :re-load="handleUpdateInfoReload"
    ></enter-form-tax-declare>
  </div>
</template>

<style lang="scss" scoped>
.receive-invoice {
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
}
</style>

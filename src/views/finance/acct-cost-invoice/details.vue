<script>
import { getAcctCostInvoiceById } from '@/api/finance/acct-cost-invoice'
import { getAcctCostInvoiceDetail } from '@/api/finance/acct-cost-invoice-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import dayjs from '@/utils/day'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

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
    },
    businessType: String
  },
  data() {
    return {
      constant,
      enums,
      loading: false,
      form: {
        id: 0,
        payCompanyType: enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMER'),
        payCompanyId: 0,
        payCompanyName: '',
        costName: '',
        costType: enums.COST_TYPE.getFieldByKey('VARIED'),
        orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT'),
        costDate: dayjs().format('YYYY-MM-DD'),
        orderNo: '',
        costCurrency: '',
        costMoney: 0,
        feeTax: '',
        settleCurrency: '',
        settleMoney: 0,
        settleDate: '',
        settleRate: 0,
        relationBillType: '0',
        relationBillNo: '',
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
      showBtns: {
        edit: false,
        del: false
      },
      statusForm: {
        verifyStatus: ''
      },
      dicts: {},
      orderTypes: [],
      showPage: false,
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getAcctCostInvoiceDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ costInvoiceId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      }
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    payCompanyModuleName() {
      let moduleName = constant.AUTOCOMPLETE_KEY_CUSTOMER
      switch (this.form.receiptCompanyType) {
        case enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMER'):
          moduleName = constant.AUTOCOMPLETE_KEY_CUSTOMER
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('SUPPLIER'):
          moduleName = constant.AUTOCOMPLETE_KEY_SUPPLIER
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('TRANSPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_TRANSPORT
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMS'):
          moduleName = constant.AUTOCOMPLETE_KEY_CUSTOMS
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS'):
          moduleName = constant.AUTOCOMPLETE_KEY_FUNDERS
          break
      }
      return moduleName
    },
    orderModuleName() {
      let moduleName = enums.ORDER_TYPE.getFieldByKey('IMPORT')
      switch (this.form.orderType) {
        case enums.ORDER_TYPE.getFieldByKey('IMPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_IMPORT_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('EXPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_EXPORT_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_PURCHASE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_SALE'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_SALE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('PURCHASE'):
          moduleName = constant.AUTOCOMPLETE_KEY_PURCHASE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('STORAGE'):
          moduleName = constant.AUTOCOMPLETE_KEY_STORAGE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_FREIGHT_ORDER
          break
      }
      return moduleName
    }
  },
  mounted() {
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_RELATION_BILL_TYPE, DICTS_PAY_COMPANY_TYPE, DICTS_ORDER_TYPE, DICTS_COST_TYPE, DICTS_TAX_RATE, DICTS_VERIFY_STATUS } =
          constant
        Promise.all([
          getDataDictionary([
            DICTS_RELATION_BILL_TYPE,
            DICTS_PAY_COMPANY_TYPE,
            DICTS_ORDER_TYPE,
            DICTS_COST_TYPE,
            DICTS_TAX_RATE,
            DICTS_VERIFY_STATUS
          ]),
          getAcctCostInvoiceById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { verifyStatus, createByName, createTime } = info.data
          this.dicts = dicts
          this.orderTypes = this.dicts[DICTS_ORDER_TYPE].filter(v => v.value !== enums.ORDER_TYPE.getFieldByKey('PURCHASE'))
          this.createForm = {
            createByName,
            createTime
          }

          this.statusForm = {
            verifyStatus
          }

          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_ACCT_COST_INVOICE_EDIT],
            del: this.permissions[constant.PERMISSION_ACCT_COST_INVOICE_DEL]
          }

          this.columns = this.handleDetailsColumns()

          if (isFunction(cb)) cb()
          this.showPage = true
          this.loading = false
        })
      })
    },
    /** ??????????????? */
    handleDetailsColumns() {
      return [
        { field: 'costInvoiceNo', title: '????????????' },
        { field: 'productName', title: '??????' },
        { field: 'productModel', title: '??????' },
        { field: 'productBrand', title: '??????' },
        { field: 'productOrigin', title: '??????' },
        { field: 'productUnit', title: '??????' },
        {
          field: 'qty',
          title: '??????',
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        {
          field: 'settleMoney',
          title: '????????????',
          formatter: {
            type: 'number'
          }
        },
        { field: 'taxRate', title: '??????' }
      ]
    },
    handleEdit() {
      this.enterForm.visible = true
    },
    handleDelete() {
      this.deleteFn()
    },
    detailsReLoad(isClearSelect) {
      this.$refs['detailsRef'].refresh(isClearSelect)
    },
    // ????????????????????????????????????????????????
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
    class="common-operate acct-cost-invoice is-details-adaptive"
    element-loading-text="???????????????"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-main">
          <base-form ref="formRef" :model="form" label-width="90px" size="mini">
            <!-- ???????????? -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="???????????????" prop="payCompanyType">
                    <base-select
                      v-model="form.payCompanyType"
                      placeholder="????????????????????????"
                      disabled
                      :clearable="false"
                      :options="dicts[constant.DICTS_PAY_COMPANY_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="payCompanyName">
                    <business-autocomplete-basic
                      v-model="form.payCompanyName"
                      label="?????????"
                      disabled
                      placeholder="??????????????????"
                      :module-name="payCompanyModuleName"
                      :auto-assign="{
                        payCompanyId: 'companyId'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="principalName">
                    <business-autocomplete-basic
                      v-model="form.principalName"
                      label="????????????"
                      placeholder="?????????????????????"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                      :auto-assign="{
                        principalId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="costType">
                    <base-select v-model="form.costType" placeholder="?????????????????????" disabled :options="dicts[constant.DICTS_COST_TYPE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="costName">
                    <business-autocomplete-basic
                      v-model="form.costName"
                      label="????????????"
                      placeholder="?????????????????????"
                      disabled
                      :params="{
                        costType: form.costType
                      }"
                      :module-name="constant.AUTOCOMPLETE_KEY_COST_ITEM"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????????????????" prop="costDate">
                    <base-date-picker v-model="form.costDate" type="date" disabled placeholder="????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="settleDate">
                    <base-date-picker v-model="form.settleDate" type="date" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="costCurrency">
                    <business-autocomplete-basic
                      v-model="form.costCurrency"
                      label="????????????"
                      placeholder="?????????????????????"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="costMoney">
                    <base-input-number v-model="form.costMoney" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="feeTax">
                    <base-select v-model="form.feeTax" placeholder="?????????????????????" disabled :options="dicts[constant.DICTS_TAX_RATE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="settleRate">
                    <base-input-number v-model="form.settleRate" disabled :precision="6" placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="settleCurrency">
                    <business-autocomplete-basic
                      v-model="form.settleCurrency"
                      label="????????????"
                      disabled
                      placeholder="?????????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <!-- ????????????????????????????????????: ????????????*??????  ?????????????????????????????????: ????????????*??????*(1+????????????) -->
                <base-col :span="6">
                  <base-form-item label="????????????" prop="settleMoney">
                    <base-input-number v-model="form.settleMoney" disabled />
                  </base-form-item>
                </base-col>

                <!-- ??????????????????????????? ???????????? -->
                <template v-if="businessType">
                  <base-col :span="6">
                    <base-form-item label="??????????????????" prop="relationBillType">
                      <base-select
                        v-model="businessType"
                        disabled
                        placeholder="???????????????????????????"
                        :clearable="false"
                        :options="dicts[constant.DICTS_RELATION_BILL_TYPE]"
                      />
                    </base-form-item>
                  </base-col>
                  <base-col :span="6">
                    <base-form-item label="???????????????" prop="relationBillNo">
                      <business-autocomplete-basic
                        v-model="form.relationBillNo"
                        label="???????????????"
                        placeholder="????????????????????????"
                        :params="{
                          auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS')
                        }"
                        disabled
                        :module-name="
                          businessType === enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATION')
                            ? constant.AUTOCOMPLETE_KEY_CUSTOMS_ORDER_DECLAR
                            : constant.AUTOCOMPLETE_KEY_CUSTOMS_ORDER_TRANSPORT_DECLAR
                        "
                        :auto-assign="{
                          relationBillId: 'id'
                        }"
                        :form="form"
                      ></business-autocomplete-basic>
                    </base-form-item>
                  </base-col>
                </template>
                <!-- ???????????? ???????????? -->
                <template v-else>
                  <base-col :span="6">
                    <base-form-item label="???????????????" prop="relationBillNo">
                      <base-input v-model="form.relationBillNo" disabled />
                    </base-form-item>
                  </base-col>
                </template>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="??????" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="???????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--?????????????????? -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ??????????????????
              </span>
              <div class="common-operate-block-body">
                <base-page
                  v-if="showPage"
                  ref="detailsRef"
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
                  :name="constant.TABLE_NAME_BUS_IMPORT_ACCT_COST_INVO_DETAILS"
                />
              </div>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">??????</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.VERIFY_STATUS.getFieldByValue(statusForm.verifyStatus, 'color') }">
              {{ enums.VERIFY_STATUS.getFieldByValue(statusForm.verifyStatus) }}
            </div>
          </div>
        </div>

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
    <enter-form
      v-model="enterForm.visible"
      :business-type="businessType"
      :type="enterForm.type"
      :table-row="{ id: tableRow.id }"
      :re-load="handleUpdateInfoReload"
    />
  </div>
</template>

<style lang="scss" scoped>
.acct-cost-invoice {
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
  }
}
</style>

<script>
import { getAcctBankAcceptanceById } from '@/api/finance/acct-bank-acceptance'
import { getAcctBankAcceptanceEndosement } from '@/api/finance/acct-bank-acceptance-endosement'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import UpdateArrival from './components/update-arrival'
import UpdateDiscount from './components/update-discount'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm, UpdateArrival, UpdateDiscount },
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
        drawerName: '',
        drawerBankName: '',
        drawerAccount: '',
        acceptanceCompanyType: '',
        acceptanceCompanyName: '',
        acceptanceCompanyId: 0,
        acceptanceAccount: '',
        payeeName: '',
        payeePrincipalCompanyId: 0,
        payeeBankName: '',
        payeeAccount: '',
        payeePrincipalId: 0,
        remark: ''
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      updateArrival: {
        visible: false,
        row: {}
      },
      updateDiscount: {
        visible: false,
        row: {}
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      showBtns: {
        edit: false,
        del: false,
        gxdz: false,
        gxtx: false
      },
      dicts: {},
      showPage: false,
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getAcctBankAcceptanceEndosement({
          ...pager,
          ...transforArrayPayload(Object.assign({ acceptanceId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      payCompanyTypes: []
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    acceptanceCompanyModuleName() {
      let moduleName = ''
      switch (this.form.acceptanceCompanyType) {
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
        const { DICTS_BILL_TYPE, DICTS_ACCEPTANCE_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_DISCOUNT_BEAR_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_BILL_TYPE, DICTS_ACCEPTANCE_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_DISCOUNT_BEAR_TYPE]),
          getAcctBankAcceptanceById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { createByName, createTime } = info.data
          this.dicts = dicts
          this.payCompanyTypes = this.dicts[DICTS_PAY_COMPANY_TYPE].filter(
            v => ![enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS')].includes(v.value)
          )

          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_EDIT],
            del: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_DEL],
            gxdz: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_UPDATE_ARRIVAL],
            gxtx: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_UPDATE_DISCOUNT]
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
        { field: 'endorserName', title: '???????????????' },
        { field: 'endorsementDate', title: '????????????' },
        { field: 'endorseeName', title: '??????????????????' }
      ]
    },
    handleUpdateArrival() {
      const { id: acceptanceId, arrivalDate, arrivalMoney } = this.form
      this.updateArrival = {
        visible: true,
        row: {
          acceptanceId,
          arrivalDate,
          arrivalMoney
        }
      }
    },
    handleUpdateDiscount() {
      const {
        id: acceptanceId,
        discountName,
        discountTax,
        discountRate,
        discountInterest,
        discountDate,
        discountCharge,
        discountBearType,
        discountBankName
      } = this.form
      this.updateDiscount = {
        visible: true,
        row: {
          acceptanceId,
          discountName,
          discountTax,
          discountRate,
          discountInterest,
          discountDate,
          discountCharge,
          discountBearType,
          discountBankName
        }
      }
    },
    handleEdit() {
      this.enterForm.visible = true
    },
    handleDelete() {
      this.deleteFn()
    },
    // ????????????????????????????????????????????????
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate acct-bank-acceptance is-details-adaptive"
    element-loading-text="???????????????"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-main">
          <base-form ref="formRef" :model="form" label-width="100px" size="mini">
            <!-- ???????????? -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="????????????" prop="billType">
                    <base-select v-model="form.billType" disabled placeholder="?????????????????????" :options="dicts[constant.DICTS_BILL_TYPE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="billNo">
                    <base-input v-model="form.billNo" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="expiryDate">
                    <base-date-picker v-model="form.expiryDate" disabled type="date" placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="receiptDate">
                    <base-date-picker v-model="form.receiptDate" disabled type="date" placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="releaseDate">
                    <base-date-picker v-model="form.releaseDate" disabled type="date" placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="acceptanceCurrency">
                    <business-autocomplete-basic
                      v-model="form.acceptanceCurrency"
                      disabled
                      label="??????"
                      placeholder="???????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="acceptanceMoney">
                    <base-input-number v-model="form.acceptanceMoney" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????????????????" prop="agreementNo">
                    <base-input v-model="form.agreementNo" disabled placeholder="???????????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="??????" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="???????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!-- ???????????? -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="???????????????" prop="drawerName">
                    <base-input v-model="form.drawerName" disabled placeholder="????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????????????????" prop="drawerBankName">
                    <base-input v-model="form.drawerBankName" disabled placeholder="??????????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="drawerAccount">
                    <base-input v-model="form.drawerAccount" disabled placeholder="????????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="???????????????" prop="acceptanceCompanyType">
                    <base-select v-model="form.acceptanceCompanyType" disabled placeholder="????????????????????????" :options="payCompanyTypes" />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.acceptanceCompanyType" :span="6">
                  <base-form-item label="?????????" prop="acceptanceCompanyName">
                    <business-autocomplete-basic
                      v-model="form.acceptanceCompanyName"
                      label="?????????"
                      disabled
                      placeholder="??????????????????"
                      :module-name="acceptanceCompanyModuleName"
                      :auto-assign="{
                        acceptanceCompanyId: 'companyId'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????????????????" prop="acceptanceAccount">
                    <base-input v-model="form.acceptanceAccount" disabled placeholder="??????????????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="???????????????" prop="payeeName">
                    <business-autocomplete-basic
                      v-model="form.payeeName"
                      label="???????????????"
                      disabled
                      placeholder="????????????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????????????????" prop="payeeBankName">
                    <business-autocomplete-bank
                      v-model="form.payeeBankName"
                      value-key="bankName"
                      disabled
                      label="?????????????????????"
                      placeholder="??????????????????????????????"
                      :params="{
                        companyId: form.payeePrincipalCompanyId
                      }"
                    ></business-autocomplete-bank>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="payeeAccount">
                    <base-input v-model="form.payeeAccount" disabled placeholder="????????????????????????"></base-input>
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--???????????? -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
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
                  :name="constant.TABLE_NAME_ACCT_BANK_ACCEPTANCE_DETAILS"
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
        <el-button v-if="showBtns.gxdz" icon="el-icon-s-operation" type="primary" @click="handleUpdateArrival">????????????</el-button>
        <el-button v-if="showBtns.gxtx" icon="el-icon-s-operation" type="primary" @click="handleUpdateDiscount">????????????</el-button>
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
    <update-arrival v-model="updateArrival.visible" :table-row="updateArrival.row" :re-load="reLoad" />
    <update-discount v-model="updateDiscount.visible" :table-row="updateDiscount.row" :re-load="reLoad" />
  </div>
</template>

<style lang="scss" scoped>
.acct-bank-acceptance {
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
    min-height: 350px;
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

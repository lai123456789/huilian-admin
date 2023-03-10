<script>
import { getAcctLetterOfCreditIssuingById } from '@/api/finance/acct-letter-of-credit-issuing'
import { getDataDictionary } from '@/api/admin/dicts'
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
    }
  },
  data() {
    return {
      constant,
      enums,
      loading: false,
      form: {
        id: 0,
        creditType: '',
        creditNo: '',
        issuingBankName: '',
        issuingDate: '',
        contractNo: '',
        beneficiaryCompanyType: '',
        beneficiaryCompanyName: '',
        beneficiaryCompanyId: 0,
        beneficiaryCountry: '',
        applicantCountryCode: void 0,
        beneficiaryAddress: '',
        applicantCompanyName: '',
        applicantAddress: '',
        applicantCountry: '',
        beneficiaryCountryCode: void 0,
        currencyName: '',
        creditMoney: 0,
        deliveryDate: [],
        expiryDate: '',
        expiryPlace: '',
        russianSea: '',
        russianSeaCode: void 0,
        destPort: '',
        destPortCode: void 0,
        dischargePort: '',
        dischargePortCode: void 0,
        shipmentDate: '',
        shippingCountry: '',
        shippingCountryCode: void 0,
        shippingDesc: '',
        transModeName: '',
        transModeCode: void 0,
        usanceFlag: enums.USANCE_FLAG.getFieldByKey('BE'),
        usanceDay: 0
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
      beneficiaryCompanyTypes: [],
      rightLabelWidth: '70px'
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    beneficiaryCompanyModuleName() {
      let moduleName = ''
      switch (this.form.beneficiaryCompanyType) {
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
        const { DICTS_PAY_COMPANY_TYPE, DICTS_CREDIT_TYPE, DICTS_USANCE_FLAG } = constant
        Promise.all([
          getDataDictionary([DICTS_PAY_COMPANY_TYPE, DICTS_CREDIT_TYPE, DICTS_USANCE_FLAG]),
          getAcctLetterOfCreditIssuingById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { createByName, createTime } = info.data
          this.dicts = dicts
          this.beneficiaryCompanyTypes = this.dicts[DICTS_PAY_COMPANY_TYPE].filter(
            v => ![enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS')].includes(v.value)
          )

          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(this.form, info.data, {
            deliveryDate: [info.data.deliveryStartDate, info.data.deliveryEndDate]
          })

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_ACCT_CREDIT_ISSUING_EDIT],
            del: this.permissions[constant.PERMISSION_ACCT_CREDIT_ISSUING_DEL]
          }

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
    class="common-operate acct-credit-issuing is-details-adaptive"
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
              <base-row>
                <base-col :span="6">
                  <base-form-item label="????????????" prop="creditNo">
                    <base-input v-model="form.creditNo" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="issuingDate">
                    <base-date-picker v-model="form.issuingDate" disabled type="date" placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="creditType">
                    <base-select
                      v-model="form.creditType"
                      disabled
                      placeholder="????????????????????????"
                      :options="dicts[constant.DICTS_CREDIT_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="issuingBankName">
                    <base-input v-model="form.issuingBankName" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="currencyName">
                    <business-autocomplete-basic
                      v-model="form.currencyName"
                      disabled
                      label="??????"
                      placeholder="???????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="creditMoney">
                    <base-input-number v-model="form.creditMoney" disabled placeholder="???????????????" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="contractNo">
                    <base-input v-model="form.contractNo" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="usanceFlag">
                    <base-select
                      v-model="form.usanceFlag"
                      disabled
                      :clearable="false"
                      placeholder="?????????????????????"
                      :options="dicts[constant.DICTS_USANCE_FLAG]"
                      @change="() => (form.usanceDay = 0)"
                    />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.usanceFlag === enums.USANCE_FLAG.getFieldByKey('FAR')" :span="6">
                  <base-form-item label="????????????" prop="usanceDay">
                    <base-input-number v-model="form.usanceDay" disabled placeholder="?????????????????????" :precision="0" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="???????????????" prop="beneficiaryCompanyType">
                    <base-select
                      v-model="form.beneficiaryCompanyType"
                      disabled
                      placeholder="????????????????????????"
                      :options="beneficiaryCompanyTypes"
                    />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.beneficiaryCompanyType" :span="6">
                  <base-form-item label="?????????" prop="beneficiaryCompanyName">
                    <business-autocomplete-basic
                      v-model="form.beneficiaryCompanyName"
                      disabled
                      label="?????????"
                      placeholder="??????????????????"
                      :module-name="beneficiaryCompanyModuleName"
                      :auto-assign="{
                        beneficiaryCompanyId: 'companyId'
                      }"
                      :form="form"
                      @clear="() => (form.beneficiaryCompanyId = 0)"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????????????????" prop="beneficiaryCountry">
                    <business-autocomplete-ccl
                      v-model="form.beneficiaryCountry"
                      disabled
                      label="?????????????????????"
                      placeholder="??????????????????????????????"
                      :auto-assign="{
                        beneficiaryCountryCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                      @clear="() => (form.beneficiaryCountryCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="form.beneficiaryCompanyType ? 6 : 12">
                  <base-form-item label="???????????????" prop="beneficiaryAddress">
                    <base-input v-model="form.beneficiaryAddress" disabled placeholder="????????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="?????????" prop="applicantCompanyName">
                    <base-input v-model="form.applicantCompanyName" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????????????????" prop="applicantCountry">
                    <business-autocomplete-ccl
                      v-model="form.applicantCountry"
                      label="?????????????????????"
                      disabled
                      placeholder="??????????????????????????????"
                      :auto-assign="{
                        applicantCountryCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                      @clear="() => (form.applicantCountryCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="???????????????" prop="applicantAddress">
                    <base-input v-model="form.applicantAddress" disabled placeholder="????????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="?????????" prop="expiryDate">
                    <base-date-picker v-model="form.expiryDate" disabled type="date" placeholder="???????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="9">
                  <base-form-item label="????????????" prop="deliveryDate">
                    <base-date-picker v-model="form.deliveryDate" disabled type="daterange" placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="9">
                  <base-form-item label="??????????????????" prop="expiryPlace">
                    <base-input v-model="form.expiryPlace" disabled placeholder="???????????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="????????????" prop="shipmentDate">
                    <base-input v-model="form.shipmentDate" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????????????????" prop="shippingCountry">
                    <business-autocomplete-ccl
                      v-model="form.shippingCountry"
                      disabled
                      label="??????????????????"
                      placeholder="???????????????????????????"
                      :auto-assign="{
                        shippingCountryCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                      @clear="() => (form.shippingCountryCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="????????????" prop="shippingDesc">
                    <base-input v-model="form.shippingDesc" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="????????????" prop="transModeName">
                    <business-autocomplete-ccl
                      v-model="form.transModeName"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSPORT"
                      label="????????????"
                      placeholder="?????????????????????"
                      :auto-assign="{
                        transModeCode: 'code'
                      }"
                      :form="form"
                      @clear="() => (form.transModeCode = void 0)"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="russianSea">
                    <business-autocomplete-ccl
                      v-model="form.russianSea"
                      disabled
                      label="?????????"
                      :auto-assign="{
                        russianSeaCode: 'code'
                      }"
                      :form="form"
                      placeholder="??????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                      @clear="() => (form.russianSeaCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="destPort">
                    <business-autocomplete-ccl
                      v-model="form.destPort"
                      disabled
                      label="?????????"
                      :auto-assign="{
                        destPortCode: 'code'
                      }"
                      :form="form"
                      placeholder="??????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                      @clear="() => (form.destPortCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="dischargePort">
                    <business-autocomplete-ccl
                      v-model="form.dischargePort"
                      disabled
                      label="?????????"
                      :auto-assign="{
                        dischargePortCode: 'code'
                      }"
                      :form="form"
                      placeholder="??????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                      @clear="() => (form.dischargePortCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="12">
                  <base-form-item label="??????" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="???????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
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
  </div>
</template>

<style lang="scss" scoped>
.acct-credit-issuing {
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

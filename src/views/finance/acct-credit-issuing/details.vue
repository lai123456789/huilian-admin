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
    // 获取详情数据
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
    // 修改某一项时，刷新列表页和详情页
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
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-main">
          <base-form ref="formRef" :model="form" label-width="100px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row>
                <base-col :span="6">
                  <base-form-item label="信用证号" prop="creditNo">
                    <base-input v-model="form.creditNo" disabled placeholder="请输入信用证号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="开证日期" prop="issuingDate">
                    <base-date-picker v-model="form.issuingDate" disabled type="date" placeholder="选择开证日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="信用证类型" prop="creditType">
                    <base-select
                      v-model="form.creditType"
                      disabled
                      placeholder="请选择信用证类型"
                      :options="dicts[constant.DICTS_CREDIT_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="开证行" prop="issuingBankName">
                    <base-input v-model="form.issuingBankName" disabled placeholder="请输入开证行" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="币别" prop="currencyName">
                    <business-autocomplete-basic
                      v-model="form.currencyName"
                      disabled
                      label="币别"
                      placeholder="请输入币别"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="金额" prop="creditMoney">
                    <base-input-number v-model="form.creditMoney" disabled placeholder="请输入金额" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="合同号" prop="contractNo">
                    <base-input v-model="form.contractNo" disabled placeholder="请输入合同号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="是否远期" prop="usanceFlag">
                    <base-select
                      v-model="form.usanceFlag"
                      disabled
                      :clearable="false"
                      placeholder="请选择是否远期"
                      :options="dicts[constant.DICTS_USANCE_FLAG]"
                      @change="() => (form.usanceDay = 0)"
                    />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.usanceFlag === enums.USANCE_FLAG.getFieldByKey('FAR')" :span="6">
                  <base-form-item label="远期天数" prop="usanceDay">
                    <base-input-number v-model="form.usanceDay" disabled placeholder="请输入远期天数" :precision="0" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="受益人类型" prop="beneficiaryCompanyType">
                    <base-select
                      v-model="form.beneficiaryCompanyType"
                      disabled
                      placeholder="请选择受益人类型"
                      :options="beneficiaryCompanyTypes"
                    />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.beneficiaryCompanyType" :span="6">
                  <base-form-item label="受益人" prop="beneficiaryCompanyName">
                    <business-autocomplete-basic
                      v-model="form.beneficiaryCompanyName"
                      disabled
                      label="受益人"
                      placeholder="请输入受益人"
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
                  <base-form-item label="受益人国家地区" prop="beneficiaryCountry">
                    <business-autocomplete-ccl
                      v-model="form.beneficiaryCountry"
                      disabled
                      label="受益人国家地区"
                      placeholder="请输入受益人国家地区"
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
                  <base-form-item label="受益人地址" prop="beneficiaryAddress">
                    <base-input v-model="form.beneficiaryAddress" disabled placeholder="请输入受益人地址" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="申请人" prop="applicantCompanyName">
                    <base-input v-model="form.applicantCompanyName" disabled placeholder="请输入申请人" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="申请人国家地区" prop="applicantCountry">
                    <business-autocomplete-ccl
                      v-model="form.applicantCountry"
                      label="申请人国家地区"
                      disabled
                      placeholder="请输入申请人国家地区"
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
                  <base-form-item label="申请人地址" prop="applicantAddress">
                    <base-input v-model="form.applicantAddress" disabled placeholder="请输入申请人地址" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="有效期" prop="expiryDate">
                    <base-date-picker v-model="form.expiryDate" disabled type="date" placeholder="选择有效期" />
                  </base-form-item>
                </base-col>

                <base-col :span="9">
                  <base-form-item label="到单期限" prop="deliveryDate">
                    <base-date-picker v-model="form.deliveryDate" disabled type="daterange" placeholder="选择到单期限" />
                  </base-form-item>
                </base-col>

                <base-col :span="9">
                  <base-form-item label="有效期限地址" prop="expiryPlace">
                    <base-input v-model="form.expiryPlace" disabled placeholder="请输入有效期限地址" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="最迟装期" prop="shipmentDate">
                    <base-input v-model="form.shipmentDate" disabled placeholder="请输入最迟装期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="货运国家地区" prop="shippingCountry">
                    <business-autocomplete-ccl
                      v-model="form.shippingCountry"
                      disabled
                      label="货运国家地区"
                      placeholder="请输入货运国家地区"
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
                  <base-form-item label="货运描述" prop="shippingDesc">
                    <base-input v-model="form.shippingDesc" disabled placeholder="请输入货运描述" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="6">
                  <base-form-item label="运输方式" prop="transModeName">
                    <business-autocomplete-ccl
                      v-model="form.transModeName"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSPORT"
                      label="运输方式"
                      placeholder="请选择运输方式"
                      :auto-assign="{
                        transModeCode: 'code'
                      }"
                      :form="form"
                      @clear="() => (form.transModeCode = void 0)"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="起运港" prop="russianSea">
                    <business-autocomplete-ccl
                      v-model="form.russianSea"
                      disabled
                      label="起运港"
                      :auto-assign="{
                        russianSeaCode: 'code'
                      }"
                      :form="form"
                      placeholder="请输入起运港"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                      @clear="() => (form.russianSeaCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="目的港" prop="destPort">
                    <business-autocomplete-ccl
                      v-model="form.destPort"
                      disabled
                      label="目的港"
                      :auto-assign="{
                        destPortCode: 'code'
                      }"
                      :form="form"
                      placeholder="请输入目的港"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                      @clear="() => (form.destPortCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="卸货港" prop="dischargePort">
                    <business-autocomplete-ccl
                      v-model="form.dischargePort"
                      disabled
                      label="卸货港"
                      :auto-assign="{
                        dischargePortCode: 'code'
                      }"
                      :form="form"
                      placeholder="请输入卸货港"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                      @clear="() => (form.dischargePortCode = void 0)"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row>
                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="请输入备注" />
                  </base-form-item>
                </base-col>
              </base-row>
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

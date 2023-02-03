<script>
import { getCompanyCusContractById, getCompanyCusContractAuditList, auditCompanyCusContract } from '@/api/company/company-cus-contract'
import { getDataDictionary } from '@/api/admin/dicts'
import { getSysReportByMenuMarkSysReportConfig } from '@/api/admin/sys-report-config'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

// 获取一个月的天数
const getDays = () => {
  const days = []
  for (let i = 0; i <= 30; i++) {
    days.push({ label: `${i + 1}`, value: i + 1 })
  }
  return days
}

// 获取周数
const getWeeks = () => {
  const weeks = []
  for (let i = 0; i <= 6; i++) {
    let title = '日'
    switch (i) {
      case 0:
        title = '一'
        break
      case 1:
        title = '二'
        break
      case 2:
        title = '三'
        break
      case 3:
        title = '四'
        break
      case 4:
        title = '五'
        break
      case 5:
        title = '六'
        break
    }
    weeks.push({ label: `${title}`, value: i + 1 })
  }
  return weeks
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
        // 基本信息
        auditStatus: '',
        templateNo: void 0,
        templateName: '',
        contractNo: '',
        contractName: '',
        tradeMode: '',
        customerName: '',
        principalName: '',
        signDate: '',
        effectiveDate: '',
        expireDate: '',
        remark: '',

        // 汇率约定
        exchangeRateType: '',
        exchangeRateTime: '',
        cargoRateType: '',
        taxRateType: '',

        // 滞纳金约定
        overdueRate: 0,
        interestFreeDay: '',

        // 货款约定
        cargoAdvanceFlag: enums.WHETHER_STATUS.getFieldByKey('YES'),
        cargoInterestDay: enums.INTEREST_METHOD.getFieldByKey('DAY'),
        cargoAdvanceRate: 0,
        depositRate: 0,
        cargoHappenDate: '',
        cargoSettlementMode: '',

        // 服务费约定
        agencyCollectFlag: enums.WHETHER_STATUS.getFieldByKey('YES'),
        agencyMark: enums.AGENCY_MARK.getFieldByKey('RATIO'),
        agencyPriceConfig: [],
        agencyRate: 0,
        extraAgencyMinFee: '',
        agencyMinFee: '',
        agencyHappenDate: '',
        agencySettlementMode: '',
        agencyFormula: '',

        // 税费约定
        taxAdvanceFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
        taxActualFlag: enums.WHETHER_STATUS.getFieldByKey('YES'),
        taxHappenDate: '',
        taxSettlementMode: '',
        taxCifTariffFormula: '',
        taxFobTariffFormula: '',
        taxExciseFormula: '',
        taxVatFormula: '',

        // 附件条件
        deliveryFlag: '',
        invoiceFlag: '',
        refundTaxFlag: '',
        agencyFeeFlag: '',
        otherFeeFlag: ''
      },
      // 货款约定
      cargoSettleObj: {
        paymentDays: {
          accountDay: ''
        },
        monthlyState: {
          monthNumber: '',
          monthDay: ''
        },
        weekState: {
          weekDay: '',
          weekNumber: ''
        },
        settleState: [
          {
            businessBeginDay: '',
            businessEndDay: '',
            monthNumber: '',
            monthDay: ''
          }
        ]
      },
      // 服务费约定
      agencySettleObj: {
        paymentDays: {
          accountDay: ''
        },
        monthlyState: {
          monthNumber: '',
          monthDay: ''
        },
        weekState: {
          weekDay: '',
          weekNumber: ''
        },
        settleState: [
          {
            businessBeginDay: '',
            businessEndDay: '',
            monthNumber: '',
            monthDay: ''
          }
        ]
      },
      // 税费约定
      taxSettleObj: {
        paymentDays: {
          accountDay: ''
        },
        monthlyState: {
          monthNumber: '',
          monthDay: ''
        },
        weekState: {
          weekDay: '',
          weekNumber: ''
        },
        settleState: [
          {
            businessBeginDay: '',
            businessEndDay: '',
            monthNumber: '',
            monthDay: ''
          }
        ]
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      dicts: {},
      createForm: {
        createByName: '',
        createTime: ''
      },
      statusForm: {
        status: ''
      },
      cargoHappenDates: [],
      agencyHappenDates: [],
      taxHappenDates: [],
      days: getDays(),
      weeks: getWeeks(),
      rightLabelWidth: '70px',
      columns: [
        {
          field: 'currencyName',
          title: '出口币别'
        },
        {
          field: 'costMoney',
          title: '出口金额',
          align: 'right',
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'proxyFee',
          title: '服务费'
        }
      ],
      request: null,
      showAgencyPriceConfigGrid: false,
      requestApi: {
        list: () => getCompanyCusContractAuditList(this.tableRow.id),
        save: auditCompanyCusContract
      },
      showAuditDetailsBtn: false,
      showBtns: {
        edit: false,
        del: false,
        export: false
      },
      businessExport: {
        visible: false,
        request: async () => {
          const { data } = await getSysReportByMenuMarkSysReportConfig({ menuMark: constant.PERMISSION_SERVICE_AGREE_EXPORT })
          return { data }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    // 境内、境外没有汇率约定
    hideRateAgree() {
      const tradeModes = [
        enums.TRADE_MODE.getFieldByKey('PURCHASE_AGENT'),
        enums.TRADE_MODE.getFieldByKey('SALES_AGENT'),
        enums.TRADE_MODE.getFieldByKey('FREIGHT_AGENT')
      ]
      return !tradeModes.includes(this.form.tradeMode)
    },
    hideCargo() {
      // 6货运代理
      const tradeModes = [enums.TRADE_MODE.getFieldByKey('FREIGHT_AGENT')]
      return !tradeModes.includes(this.form.tradeMode)
    },
    hideTaxAgree() {
      const tradeModes = [
        enums.TRADE_MODE.getFieldByKey('EXPORT_AGENT'),
        enums.TRADE_MODE.getFieldByKey('EXPORT_SELF'),
        enums.TRADE_MODE.getFieldByKey('PURCHASE_AGENT'),
        enums.TRADE_MODE.getFieldByKey('SALES_AGENT'),
        enums.TRADE_MODE.getFieldByKey('FREIGHT_AGENT')
      ]
      return !tradeModes.includes(this.form.tradeMode)
    },
    hideOverdueAgree() {
      const tradeModes = [enums.TRADE_MODE.getFieldByKey('SALES_AGENT')]
      return !tradeModes.includes(this.form.tradeMode)
    },
    hideAgencyAgree() {
      const tradeModes = [enums.TRADE_MODE.getFieldByKey('SALES_AGENT')]
      return !tradeModes.includes(this.form.tradeMode)
    },
    hideAdditionalAgree() {
      const tradeModes = [enums.TRADE_MODE.getFieldByKey('SALES_AGENT')]
      return !tradeModes.includes(this.form.tradeMode)
    }
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_SERVICE_AGREE_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.loading = true
      this.showAgencyPriceConfigGrid = false
      const {
        DICTS_TRADE_MODE,
        DICTS_AUDIT_STATUS,
        DICTS_AGREE_STATUS,
        DICTS_WHETHER_STATUS,
        DICTS_FOREIGN_PRICE_TYPE,
        DICTS_PAYMENT_EXCHANGE_RATE,
        DICTS_TAXES_EXCHANGE_RATE,
        DICTS_ADVANCE_RATE_TYPE,
        DICTS_INTEREST_METHOD,
        DICTS_SETTLEMENT_MANNER,
        DICTS_DELIVERY_FLAG,
        DICTS_INVOICE_FLAG,
        DICTS_REFUND_TAX_FLAG,
        DICTS_AGENCY_FEE_FLAG,
        DICTS_OTHER_FEE_FLAG,
        DICTS_RECEIVABLE_STARTE_DAY,
        DICTS_AGENCY_MARK
      } = constant
      const [dicts, info] = await Promise.all([
        getDataDictionary([
          DICTS_TRADE_MODE,
          DICTS_AUDIT_STATUS,
          DICTS_AGREE_STATUS,
          DICTS_WHETHER_STATUS,
          DICTS_FOREIGN_PRICE_TYPE,
          DICTS_PAYMENT_EXCHANGE_RATE,
          DICTS_TAXES_EXCHANGE_RATE,
          DICTS_ADVANCE_RATE_TYPE,
          DICTS_INTEREST_METHOD,
          DICTS_SETTLEMENT_MANNER,
          DICTS_DELIVERY_FLAG,
          DICTS_INVOICE_FLAG,
          DICTS_REFUND_TAX_FLAG,
          DICTS_AGENCY_FEE_FLAG,
          DICTS_OTHER_FEE_FLAG,
          DICTS_RECEIVABLE_STARTE_DAY,
          DICTS_AGENCY_MARK
        ]),
        getCompanyCusContractById(this.tableRow.id)
      ])
      const { status, companyCusContractDetailVO, createByName, createTime } = info.data
      const { agencyPriceConfig } = companyCusContractDetailVO
      this.dicts = dicts
      this.handleReceivableStarteDay(this.dicts[constant.DICTS_RECEIVABLE_STARTE_DAY])
      Object.assign(this.form, this.handleDataAssemble(info.data || {}))
      this.statusForm = {
        status
      }
      this.createForm = {
        createByName,
        createTime
      }

      this.showBtns = {
        edit: this.permissions[constant.PERMISSION_SERVICE_AGREE_EDIT],
        del: this.permissions[constant.PERMISSION_SERVICE_AGREE_DEL],
        export: this.permissions[constant.PERMISSION_SERVICE_AGREE_EXPORT]
      }

      // 先赋值
      this.request = () => {
        return new Promise(resolve => {
          resolve({
            data: agencyPriceConfig || [],
            total: agencyPriceConfig ? agencyPriceConfig.length : 0
          })
        })
      }
      // 在展示
      this.showAgencyPriceConfigGrid = true
      if (cb) cb()
      this.loading = false
    },
    // 数据组装
    handleDataAssemble(formData) {
      // companyCusContractDetailVO: 包含了服务费、货款、税款的数据
      // companyCusSettlementDayVOList: 包含了服务费、货款、税款结算方式的数据组
      const { companyCusContractDetailVO, companyCusSettlementDayVOList, overdueRate } = formData
      const { agencySettlementMode, cargoSettlementMode, taxSettlementMode } = companyCusContractDetailVO
      const _companyCusContractDetailVO = { ...companyCusContractDetailVO }
      const { cargoInterestDay, cargoAdvanceRate, depositRate, agencyRate, agencyPriceConfig } = _companyCusContractDetailVO
      if (companyCusSettlementDayVOList && companyCusSettlementDayVOList.length > 0) {
        // eslint-disable-next-line no-inner-declarations
        const assignment = (obj, settleMode, value) => {
          switch (settleMode) {
            // 账期
            case enums.SETTLEMENT_MANNER.getFieldByKey('PAYMENT_DAYS'):
              this[obj].paymentDays.accountDay = value.accountDay
              break
            // 月结
            case enums.SETTLEMENT_MANNER.getFieldByKey('MONTH'):
              this[obj].monthlyState.monthNumber = value.monthNumber
              this[obj].monthlyState.monthDay = value.monthDay
              break
            // 周结
            case enums.SETTLEMENT_MANNER.getFieldByKey('WEEK'):
              this[obj].weekState.weekNumber = value.weekNumber
              this[obj].weekState.weekDay = value.weekDay
              break
            // 结账日
            case enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT'):
              this[obj].settleState.push({
                businessBeginDay: value.businessBeginDay,
                businessEndDay: value.businessEndDay,
                monthNumber: value.monthNumber,
                monthDay: value.monthDay
              })
              break
          }
        }

        this['cargoSettleObj'].settleState = []
        this['agencySettleObj'].settleState = []
        this['taxSettleObj'].settleState = []

        companyCusSettlementDayVOList.forEach(v => {
          // 费用类别（0货款，1服务费，2税款）
          switch (v.feeType) {
            case enums.COST_MOLD.getFieldByKey('CARGO'):
              assignment('cargoSettleObj', cargoSettlementMode, v)
              break
            case enums.COST_MOLD.getFieldByKey('AGENCY'):
              assignment('agencySettleObj', agencySettlementMode, v)
              break
            case enums.COST_MOLD.getFieldByKey('TAX'):
              assignment('taxSettleObj', taxSettlementMode, v)
              break
          }
        })
      }

      formData.cargoInterestDay = String(cargoInterestDay)

      // 小数转成百分数
      formData.overdueRate = new BigNumber(overdueRate).times(100).toNumber()
      formData.cargoAdvanceRate = new BigNumber(cargoAdvanceRate).times(100).toNumber()
      formData.depositRate = new BigNumber(depositRate).times(100).toNumber()
      formData.agencyRate = new BigNumber(agencyRate).times(100).toNumber()

      // 处理完下面的对象之后，删除
      delete formData.companyCusContractDetailVO
      delete formData.companyCusSettlementDayVOList

      this.$nextTick(() => {
        if (this.getAgencyPriceConfigGridInstance()) {
          this.getAgencyPriceConfigGridInstance().loadColumns(this.columns)
          this.getAgencyPriceConfigGridInstance().loadData(agencyPriceConfig || [], 'cover')
        }
      })

      return Object.assign(_companyCusContractDetailVO, formData)
    },
    /* 根据条件判断来处理应收起记日 */
    handleReceivableStarteDay(receivableStarteDays) {
      /* 税款约定的应收起记日只取下单日期和报关日期 */
      this.taxHappenDates = receivableStarteDays.slice(1)

      /* 货款约定的应收起记日非进出口的业务，没有报关日期 */
      /* 出口货款应收起记日，没有付汇日期 */
      if (
        this.form.tradeMode === enums.TRADE_MODE.getFieldByKey('EXPORT_AGENT') ||
        this.form.tradeMode === enums.TRADE_MODE.getFieldByKey('EXPORT_SELF')
      ) {
        this.cargoHappenDates = [receivableStarteDays[1]]
      } else {
        this.cargoHappenDates = [receivableStarteDays[0], receivableStarteDays[1]]
      }

      /* 服务费约定的应收起记日只取下单日期和报关日期且非进出口的业务，没有报关日期 */
      this.agencyHappenDates = [
        enums.TRADE_MODE.getFieldByKey('IMPORT_AGENT'),
        enums.TRADE_MODE.getFieldByKey('IMPORT_SELF'),
        enums.TRADE_MODE.getFieldByKey('EXPORT_AGENT'),
        enums.TRADE_MODE.getFieldByKey('EXPORT_SELF')
      ].includes(this.form.tradeMode)
        ? receivableStarteDays.slice(1)
        : [receivableStarteDays[1]]
    },
    handleExport() {
      this.businessExport.visible = true
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
    getAgencyPriceConfigGridInstance() {
      return this.$refs.agencyPriceConfigGrid
    },
    // 修改某一项时，刷新列表页和详情页
    handleUpdateInfoReload(cb) {
      this.getDetailsData(() => {
        this.reLoad(true)
        if (isFunction(cb)) cb()
      })
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate cus-contract-details"
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
          <base-form ref="formRef" :model="form" label-width="100px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="协议模板" prop="templateName">
                    <business-autocomplete-basic
                      v-model="form.templateName"
                      disabled
                      label="协议模板"
                      :module-name="constant.AUTOCOMPLETE_KEY_SERVICE_AGREE_TEMPLATE"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="协议编号" prop="contractNo">
                    <base-input v-model="form.contractNo" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="贸易模式" prop="tradeMode">
                    <base-select v-model="form.tradeMode" disabled placeholder="" :options="dicts[constant.DICTS_TRADE_MODE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="合同名称" prop="contractName">
                    <base-input v-model="form.contractName" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="签约客户名称" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      label="签约客户名称"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                      :auto-assign="{
                        customerName: 'companyName',
                        customerId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="签约主体名称" prop="principalName">
                    <business-autocomplete-basic
                      v-model="form.principalName"
                      label="签约主体名称"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                      :auto-assign="{
                        principalName: 'companyName',
                        principalId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="签约日期" prop="signDate">
                    <base-date-picker v-model="form.signDate" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="生效日期" prop="effectiveDate">
                    <base-date-picker v-model="form.effectiveDate" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="到期日期" prop="expireDate">
                    <base-date-picker v-model="form.expireDate" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <template v-if="form.tradeMode !== ''">
              <!-- 汇率约定 -->
              <div v-if="hideRateAgree" class="common-operate-block">
                <span class="common-operate-block-header">
                  <i class="icon el-icon-s-grid"></i>
                  汇率约定
                </span>
                <base-row :gutter="10">
                  <base-col :span="6">
                    <base-form-item label="外汇牌价类型" prop="exchangeRateType">
                      <base-select
                        v-model="form.exchangeRateType"
                        disabled
                        :clearable="false"
                        placeholder=""
                        :options="dicts[constant.DICTS_FOREIGN_PRICE_TYPE]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="外汇牌价时间" prop="exchangeRateTime">
                      <base-time-picker v-model="form.exchangeRateTime" disabled format="HH:mm" value-format="HH:mm"></base-time-picker>
                    </base-form-item>
                  </base-col>

                  <template
                    v-if="
                      form.tradeMode !== enums.TRADE_MODE.getFieldByKey('EXPORT_AGENT') &&
                      form.tradeMode !== enums.TRADE_MODE.getFieldByKey('EXPORT_SELF')
                    "
                  >
                    <base-col :span="6">
                      <base-form-item label="货款汇率类型" prop="cargoRateType">
                        <base-select
                          v-model="form.cargoRateType"
                          disabled
                          :clearable="false"
                          placeholder=""
                          :options="dicts[constant.DICTS_PAYMENT_EXCHANGE_RATE]"
                        />
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="税款汇率类型" prop="taxRateType">
                        <base-select
                          v-model="form.taxRateType"
                          disabled
                          :clearable="false"
                          placeholder=""
                          :options="dicts[constant.DICTS_TAXES_EXCHANGE_RATE]"
                        />
                      </base-form-item>
                    </base-col>
                  </template>
                </base-row>
              </div>

              <!-- 滞纳金约定 -->
              <div v-if="hideOverdueAgree" class="common-operate-block">
                <span class="common-operate-block-header">
                  <i class="icon el-icon-s-grid"></i>
                  滞纳金约定
                </span>
                <base-row :gutter="10">
                  <base-col :span="6">
                    <base-form-item label="逾期费率" prop="exchangeRateType">
                      <base-input-number v-model="form.overdueRate" disabled placeholder="">
                        <template slot="append">%</template>
                      </base-input-number>
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="免息天数" prop="interestFreeDay">
                      <base-input-number v-model="form.interestFreeDay" disabled placeholder="" />
                    </base-form-item>
                  </base-col>
                </base-row>
              </div>

              <!-- 货款约定 -->
              <div v-if="hideCargo" class="common-operate-block">
                <span class="common-operate-block-header">
                  <i class="icon el-icon-s-grid"></i>
                  货款约定
                </span>
                <base-row :gutter="10">
                  <base-col v-if="form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')" :span="6">
                    <base-form-item label="是否垫付" prop="cargoAdvanceFlag">
                      <base-select
                        v-model="form.cargoAdvanceFlag"
                        disabled
                        :clearable="false"
                        placeholder=""
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <template v-if="form.cargoAdvanceFlag === enums.WHETHER_STATUS.getFieldByKey('YES')">
                    <base-col v-if="form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')" :span="6">
                      <base-form-item label="保证金比例" prop="depositRate">
                        <base-input-number v-model="form.depositRate" disabled placeholder="">
                          <template slot="append">%</template>
                        </base-input-number>
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="计息方式" prop="cargoInterestDay">
                        <base-select
                          v-model="form.cargoInterestDay"
                          :clearable="false"
                          disabled
                          placeholder=""
                          :options="dicts[constant.DICTS_INTEREST_METHOD]"
                        />
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="垫资费率" prop="cargoAdvanceRate">
                        <base-input-number v-model="form.cargoAdvanceRate" disabled placeholder="">
                          <template slot="append">%</template>
                        </base-input-number>
                      </base-form-item>
                    </base-col>

                    <base-col v-if="form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')" :span="6">
                      <base-form-item label="应收起记日" prop="cargoHappenDate">
                        <base-select v-model="form.cargoHappenDate" disabled placeholder="" :options="cargoHappenDates" />
                      </base-form-item>
                    </base-col>
                  </template>
                </base-row>

                <base-row
                  v-if="
                    form.cargoAdvanceFlag === enums.WHETHER_STATUS.getFieldByKey('YES') &&
                    form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')
                  "
                  :gutter="10"
                >
                  <base-col :span="6">
                    <base-form-item label="结算方式" prop="cargoSettlementMode">
                      <base-select
                        v-model="form.cargoSettlementMode"
                        disabled
                        placeholder=""
                        :options="dicts[constant.DICTS_SETTLEMENT_MANNER]"
                      />
                    </base-form-item>
                  </base-col>
                  <base-col :xl="18" :lg="18" :md="16" :sm="12" :xs="24">
                    <div
                      v-if="form.cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('PAYMENT_DAYS')"
                      class="receivable-starte-text"
                    >
                      &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                        v-model="cargoSettleObj.paymentDays.accountDay"
                        disabled
                        :clearable="false"
                        size="small"
                        class="underline-input"
                      />&nbsp;天收款
                    </div>
                    <div
                      v-else-if="form.cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('MONTH')"
                      class="receivable-starte-text"
                    >
                      &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                        v-model="cargoSettleObj.monthlyState.monthNumber"
                        disabled
                        :clearable="false"
                        size="small"
                        class="underline-input"
                      />&nbsp;个月的&nbsp;<base-select
                        v-model="cargoSettleObj.monthlyState.monthDay"
                        disabled
                        size="mini"
                        class="underline-select"
                        style="width: 80px"
                        :options="days"
                      />&nbsp;号收款
                    </div>
                    <div
                      v-else-if="form.cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('WEEK')"
                      class="receivable-starte-text"
                    >
                      &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                        v-model="cargoSettleObj.weekState.weekNumber"
                        disabled
                        :clearable="false"
                        size="small"
                        class="underline-input"
                      />&nbsp;个周的星期&nbsp;<base-select
                        v-model="cargoSettleObj.weekState.weekDay"
                        disabled
                        size="mini"
                        class="underline-select"
                        style="width: 80px"
                        :options="weeks"
                      />&nbsp;收款
                    </div>
                    <div
                      v-else-if="form.cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT')"
                      class="receivable-starte-list"
                    >
                      <template v-for="(item, index) in cargoSettleObj.settleState">
                        <div :key="`settleState_${index}`" class="receivable-starte-o">
                          <div class="receivable-starte-item">
                            {{ `${index + 1}.` }}&nbsp; 发生在当月&nbsp;<base-select
                              v-model="item.businessBeginDay"
                              disabled
                              size="mini"
                              class="underline-select"
                              style="width: 80px"
                              :options="days"
                            />&nbsp;号到&nbsp;<base-select
                              v-model="item.businessEndDay"
                              disabled
                              size="mini"
                              class="underline-select"
                              style="width: 80px"
                              :options="days"
                            />&nbsp;号的业务, 在之后的第&nbsp;<base-input-number
                              v-model="item.monthNumber"
                              disabled
                              :clearable="false"
                              size="small"
                              class="underline-input"
                            />&nbsp;个月的&nbsp;<base-select
                              v-model="item.monthDay"
                              disabled
                              size="mini"
                              class="underline-select"
                              style="width: 80px"
                              :options="days"
                            />&nbsp;号收款
                          </div>
                          <div class="receivable-starte-btn">
                            <i
                              v-if="cargoSettleObj.settleState.length - 1 === index"
                              title="添加一行"
                              class="el-icon-circle-plus-outline"
                              @click="handleAddSettlementModeRow('cargoSettleObj')"
                            ></i>
                            <i
                              v-if="cargoSettleObj.settleState.length > 1"
                              title="删除"
                              class="el-icon-circle-close"
                              @click="handleDelSettlementModeRow('cargoSettleObj', index)"
                            ></i>
                          </div>
                        </div>
                      </template>
                    </div>
                  </base-col>
                </base-row>
              </div>

              <!-- 服务费约定 -->
              <div v-if="hideAgencyAgree" class="common-operate-block">
                <span class="common-operate-block-header">
                  <i class="icon el-icon-s-grid"></i>
                  服务费约定
                </span>
                <base-row :gutter="10">
                  <!--            <base-col v-if="form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')" :span="6">-->
                  <!--              <base-form-item label="是否收取" prop="agencyCollectFlag">-->
                  <!--                <base-select-->
                  <!--                  v-model="form.agencyCollectFlag"-->
                  <!--                  :clearable="false"-->
                  <!--                  placeholder=""-->
                  <!--                  :options="dicts[constant.DICTS_WHETHER_STATUS]"-->
                  <!--                />-->
                  <!--              </base-form-item>-->
                  <!--            </base-col>-->

                  <template v-if="form.agencyCollectFlag === enums.WHETHER_STATUS.getFieldByKey('YES')">
                    <base-col
                      v-if="
                        form.tradeMode === enums.TRADE_MODE.getFieldByKey('EXPORT_AGENT') ||
                        form.tradeMode === enums.TRADE_MODE.getFieldByKey('EXPORT_SELF')
                      "
                      :span="6"
                    >
                      <base-form-item label="计费方式" prop="agencyMark">
                        <base-select
                          v-model="form.agencyMark"
                          disabled
                          :clearable="false"
                          placeholder=""
                          :options="dicts[constant.DICTS_AGENCY_MARK]"
                        />
                      </base-form-item>
                    </base-col>

                    <base-col v-if="form.agencyMark === enums.AGENCY_MARK.getFieldByKey('RATIO')" :span="6">
                      <base-form-item label="服务费率" prop="agencyRate">
                        <base-input-number v-model="form.agencyRate" disabled placeholder="">
                          <template slot="append">%</template>
                        </base-input-number>
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="最低消" prop="agencyMinFee">
                        <base-input-number v-model="form.agencyMinFee" disabled placeholder=""> </base-input-number>
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="加收服务费" prop="extraAgencyMinFee">
                        <base-input-number v-model="form.extraAgencyMinFee" disabled placeholder=""> </base-input-number>
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="应收起记日" prop="agencyHappenDate">
                        <base-select v-model="form.agencyHappenDate" disabled placeholder="" :options="agencyHappenDates" />
                      </base-form-item>
                    </base-col>
                  </template>
                </base-row>

                <template v-if="form.agencyCollectFlag === enums.WHETHER_STATUS.getFieldByKey('YES')">
                  <base-row :gutter="10">
                    <base-col :span="6">
                      <base-form-item label="结算方式" prop="agencySettlementMode">
                        <base-select
                          v-model="form.agencySettlementMode"
                          disabled
                          placeholder=""
                          :options="dicts[constant.DICTS_SETTLEMENT_MANNER]"
                        />
                      </base-form-item>
                    </base-col>
                    <base-col :xl="18" :lg="18" :md="16" :sm="12" :xs="24">
                      <div
                        v-if="form.agencySettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('PAYMENT_DAYS')"
                        class="receivable-starte-text"
                      >
                        &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                          v-model="agencySettleObj.paymentDays.accountDay"
                          disabled
                          :clearable="false"
                          size="small"
                          class="underline-input"
                        />&nbsp;天收款
                      </div>
                      <div
                        v-else-if="form.agencySettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('MONTH')"
                        class="receivable-starte-text"
                      >
                        &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                          v-model="agencySettleObj.monthlyState.monthNumber"
                          disabled
                          :clearable="false"
                          size="small"
                          class="underline-input"
                        />&nbsp;个月的&nbsp;<base-select
                          v-model="agencySettleObj.monthlyState.monthDay"
                          disabled
                          size="mini"
                          class="underline-select"
                          style="width: 80px"
                          :options="days"
                        />&nbsp;号收款
                      </div>
                      <div
                        v-else-if="form.agencySettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('WEEK')"
                        class="receivable-starte-text"
                      >
                        &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                          v-model="agencySettleObj.weekState.weekNumber"
                          disabled
                          :clearable="false"
                          size="small"
                          class="underline-input"
                        />&nbsp;个周的星期&nbsp;<base-select
                          v-model="agencySettleObj.weekState.weekDay"
                          disabled
                          size="mini"
                          class="underline-select"
                          style="width: 80px"
                          :options="weeks"
                        />&nbsp;收款
                      </div>
                      <div
                        v-else-if="form.agencySettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT')"
                        class="receivable-starte-list"
                      >
                        <template v-for="(item, index) in agencySettleObj.settleState">
                          <div :key="`settleState_${index}`" class="receivable-starte-o">
                            <div class="receivable-starte-item">
                              {{ `${index + 1}.` }}&nbsp; 发生在当月&nbsp;<base-select
                                v-model="item.businessBeginDay"
                                disabled
                                size="mini"
                                class="underline-select"
                                style="width: 80px"
                                :options="days"
                              />&nbsp;号到&nbsp;<base-select
                                v-model="item.businessEndDay"
                                disabled
                                size="mini"
                                class="underline-select"
                                style="width: 80px"
                                :options="days"
                              />&nbsp;号的业务, 在之后的第&nbsp;<base-input-number
                                v-model="item.monthNumber"
                                disabled
                                :clearable="false"
                                size="small"
                                class="underline-input"
                              />&nbsp;个月的&nbsp;<base-select
                                v-model="item.monthDay"
                                disabled
                                size="mini"
                                class="underline-select"
                                style="width: 80px"
                                :options="days"
                              />&nbsp;号收款
                            </div>
                            <div class="receivable-starte-btn">
                              <i
                                v-if="agencySettleObj.settleState.length - 1 === index"
                                title="添加一行"
                                class="el-icon-circle-plus-outline"
                                @click="handleAddSettlementModeRow('agencySettleObj')"
                              ></i>
                              <i
                                v-if="agencySettleObj.settleState.length > 1"
                                title="删除"
                                class="el-icon-circle-close"
                                @click="handleDelSettlementModeRow('agencySettleObj', index)"
                              ></i>
                            </div>
                          </div>
                        </template>
                      </div>
                    </base-col>
                  </base-row>
                  <base-row v-if="form.agencyMark === enums.AGENCY_MARK.getFieldByKey('RATIO')" :gutter="10">
                    <base-col :span="6">
                      <base-form-item label="结算公式" prop="agencyFormula">
                        <business-autocomplete-formula
                          v-model="form.agencyFormula"
                          disabled
                          value-key="formula"
                          label="结算公式"
                          placeholder=""
                          :params="{
                            tradeMode: form.tradeMode,
                            costType: enums.COST_MOLD.getFieldByKey('AGENCY')
                          }"
                        ></business-autocomplete-formula>
                      </base-form-item>
                    </base-col>
                  </base-row>
                </template>

                <!-- 计费方式为比价模式显示 -->
                <div v-if="form.agencyMark === enums.AGENCY_MARK.getFieldByKey('PRICE')">
                  <el-card class="agency-price-config-card">
                    <div slot="header" class="clearfix">
                      <span>比价配置</span>
                    </div>
                    <base-page
                      v-if="showAgencyPriceConfigGrid"
                      :request="request"
                      :columns="columns"
                      height="230px"
                      :show-toolbar="false"
                      :show-pager="false"
                      :show-checked="false"
                      :name="constant.TABLE_NAME_CONTRACT_AGENCY_PRICE"
                    />
                  </el-card>
                </div>
              </div>

              <!-- 税费约定 -->
              <div v-if="hideTaxAgree" class="common-operate-block">
                <span class="common-operate-block-header">
                  <i class="icon el-icon-s-grid"></i>
                  税费约定
                </span>
                <base-row :gutter="10">
                  <base-col :span="6">
                    <base-form-item label="是否垫付" prop="taxAdvanceFlag">
                      <base-select
                        v-model="form.taxAdvanceFlag"
                        disabled
                        :clearable="false"
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="是否实缴实收" prop="taxActualFlag">
                      <base-select
                        v-model="form.taxActualFlag"
                        disabled
                        :clearable="false"
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="应收起记日" prop="taxHappenDate">
                      <base-select v-model="form.taxHappenDate" disabled placeholder="" :options="taxHappenDates" />
                    </base-form-item>
                  </base-col>
                </base-row>

                <base-row :gutter="10">
                  <base-col :span="6">
                    <base-form-item label="结算方式" prop="taxSettlementMode">
                      <base-select
                        v-model="form.taxSettlementMode"
                        disabled
                        placeholder=""
                        :options="dicts[constant.DICTS_SETTLEMENT_MANNER]"
                      />
                    </base-form-item>
                  </base-col>
                  <base-col :xl="18" :lg="18" :md="16" :sm="12" :xs="24">
                    <div
                      v-if="form.taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('PAYMENT_DAYS')"
                      class="receivable-starte-text"
                    >
                      &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                        v-model="taxSettleObj.paymentDays.accountDay"
                        disabled
                        :clearable="false"
                        size="small"
                        class="underline-input"
                      />&nbsp;天收款
                    </div>
                    <div
                      v-else-if="form.taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('MONTH')"
                      class="receivable-starte-text"
                    >
                      &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                        v-model="taxSettleObj.monthlyState.monthNumber"
                        disabled
                        :clearable="false"
                        size="small"
                        class="underline-input"
                      />&nbsp;个月的&nbsp;<base-select
                        v-model="taxSettleObj.monthlyState.monthDay"
                        disabled
                        size="mini"
                        class="underline-select"
                        style="width: 80px"
                        :options="days"
                      />&nbsp;号收款
                    </div>
                    <div
                      v-else-if="form.taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('WEEK')"
                      class="receivable-starte-text"
                    >
                      &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                        v-model="taxSettleObj.weekState.weekNumber"
                        disabled
                        :clearable="false"
                        size="small"
                        class="underline-input"
                      />&nbsp;个周的星期&nbsp;<base-select
                        v-model="taxSettleObj.weekState.weekDay"
                        disabled
                        size="mini"
                        class="underline-select"
                        style="width: 80px"
                        :options="weeks"
                      />&nbsp;收款
                    </div>
                    <div
                      v-else-if="form.taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT')"
                      class="receivable-starte-list"
                    >
                      <template v-for="(item, index) in taxSettleObj.settleState">
                        <div :key="`settleState_${index}`" class="receivable-starte-o">
                          <div class="receivable-starte-item">
                            {{ `${index + 1}.` }}&nbsp; 发生在当月&nbsp;<base-select
                              v-model="item.businessBeginDay"
                              disabled
                              size="mini"
                              class="underline-select"
                              style="width: 80px"
                              :options="days"
                            />&nbsp;号到&nbsp;<base-select
                              v-model="item.businessEndDay"
                              disabled
                              size="mini"
                              class="underline-select"
                              style="width: 80px"
                              :options="days"
                            />&nbsp;号的业务, 在之后的第&nbsp;<base-input-number
                              v-model="item.monthNumber"
                              disabled
                              :clearable="false"
                              size="small"
                              class="underline-input"
                            />&nbsp;个月的&nbsp;<base-select
                              v-model="item.monthDay"
                              disabled
                              size="mini"
                              class="underline-select"
                              style="width: 80px"
                              :options="days"
                            />&nbsp;号收款
                          </div>
                          <div class="receivable-starte-btn">
                            <i
                              v-if="taxSettleObj.settleState.length - 1 === index"
                              title="添加一行"
                              class="el-icon-circle-plus-outline"
                              @click="handleAddSettlementModeRow('taxSettleObj')"
                            ></i>
                            <i
                              v-if="taxSettleObj.settleState.length > 1"
                              title="删除"
                              class="el-icon-circle-close"
                              @click="handleDelSettlementModeRow('taxSettleObj', index)"
                            ></i>
                          </div>
                        </div>
                      </template>
                    </div>
                  </base-col>
                </base-row>
                <template v-if="form.taxActualFlag === enums.WHETHER_STATUS.getFieldByKey('NO')">
                  <base-row v-if="form.agencyMark === enums.AGENCY_MARK.getFieldByKey('RATIO')" :gutter="10">
                    <base-col :span="6">
                      <base-form-item label="CIF关税" prop="taxCifTariffFormula">
                        <business-autocomplete-formula
                          v-model="form.taxCifTariffFormula"
                          disabled
                          value-key="formula"
                          label="CIF关税"
                          placeholder=""
                          :params="{
                            tradeMode: form.tradeMode,
                            costType: enums.COST_MOLD.getFieldByKey('TAX')
                          }"
                        />
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="FOB关税" prop="taxFobTariffFormula">
                        <business-autocomplete-formula
                          v-model="form.taxFobTariffFormula"
                          disabled
                          value-key="formula"
                          label="FOB关税"
                          placeholder=""
                          :params="{
                            tradeMode: form.tradeMode,
                            costType: enums.COST_MOLD.getFieldByKey('TAX')
                          }"
                        />
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="消费税" prop="taxExciseFormula">
                        <business-autocomplete-formula
                          v-model="form.taxExciseFormula"
                          disabled
                          value-key="formula"
                          label="消费税"
                          placeholder=""
                          :params="{
                            tradeMode: form.tradeMode,
                            costType: enums.COST_MOLD.getFieldByKey('CONSUMPTION_TAX')
                          }"
                        />
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="增值税" prop="taxVatFormula">
                        <business-autocomplete-formula
                          v-model="form.taxVatFormula"
                          disabled
                          value-key="formula"
                          label="增值税"
                          placeholder=""
                          :params="{
                            tradeMode: form.tradeMode,
                            costType: enums.COST_MOLD.getFieldByKey('VAT')
                          }"
                        />
                      </base-form-item>
                    </base-col>
                  </base-row>
                </template>
              </div>

              <!-- 附加条件 -->
              <div v-if="hideAdditionalAgree" class="common-operate-block">
                <span class="common-operate-block-header">
                  <i class="icon el-icon-s-grid"></i>
                  附加条件
                </span>
                <base-row :gutter="10">
                  <template
                    v-if="
                      form.tradeMode !== enums.TRADE_MODE.getFieldByKey('EXPORT_AGENT') &&
                      form.tradeMode !== enums.TRADE_MODE.getFieldByKey('EXPORT_SELF')
                    "
                  >
                    <base-col :span="6">
                      <base-form-item label="出货条件" prop="deliveryFlag">
                        <base-select v-model="form.deliveryFlag" disabled placeholder="" :options="dicts[constant.DICTS_DELIVERY_FLAG]" />
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="开票条件" prop="invoiceFlag">
                        <base-select v-model="form.invoiceFlag" disabled placeholder="" :options="dicts[constant.DICTS_INVOICE_FLAG]" />
                      </base-form-item>
                    </base-col>
                  </template>

                  <template v-else>
                    <base-col :span="6">
                      <base-form-item label="退税款支付条件" prop="refundTaxFlag">
                        <base-select
                          v-model="form.refundTaxFlag"
                          disabled
                          placeholder=""
                          :options="dicts[constant.DICTS_REFUND_TAX_FLAG]"
                        />
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="服务费收取方式" prop="agencyFeeFlag">
                        <base-select
                          v-model="form.agencyFeeFlag"
                          disabled
                          placeholder=""
                          :options="dicts[constant.DICTS_AGENCY_FEE_FLAG]"
                        />
                      </base-form-item>
                    </base-col>

                    <base-col :span="6">
                      <base-form-item label="杂费收取方式" prop="otherFeeFlag">
                        <base-select v-model="form.otherFeeFlag" disabled placeholder="" :options="dicts[constant.DICTS_OTHER_FEE_FLAG]" />
                      </base-form-item>
                    </base-col>
                  </template>
                </base-row>
              </div>
            </template>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">状态</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">生效状态:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.AGREE_STATUS.getFieldByValue(statusForm.status, 'color') }">
              {{ enums.AGREE_STATUS.getFieldByValue(statusForm.status) }}
            </div>
          </div>
        </div>
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
        <el-button v-if="showBtns.export" icon="el-icon-download" type="info" @click="handleExport">导出</el-button>
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
    <business-export v-model="businessExport.visible" :request="businessExport.request" :table-rows="[tableRow]" />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
  </div>
</template>

<style lang="scss">
.cus-contract-details {
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
  .receivable-starte-list {
    .receivable-starte-items {
      padding-right: 5px;
    }
    .receivable-starte-btn {
      display: inline-block;
      width: 70px;
      height: 30px;
      font-size: 22px;
      color: var(--color-primary);
      cursor: pointer;
      .el-icon-circle-plus-outline {
        margin-right: 10px;
      }
      .el-icon-circle-close {
        color: $--color-danger;
      }
    }
  }
  .underline-select {
    display: inline-block;
    margin-top: 3px;
    margin-bottom: 3px;
  }
  .receivable-starte-o {
    display: flex;
    margin-bottom: 10px;
    width: 100%;
    .receivable-starte-item {
      width: 680px;
    }
  }
  .receivable-starte-item,
  .receivable-starte-text {
    font-size: 14px;
    .underline-input {
      width: 60px;
      .el-input__inner {
        padding: 0 5px;
        width: 100%;
        border-top-width: 0;
        border-right-width: 0;
        border-bottom-width: 1px;
        border-left-width: 0;
        border-radius: 0;
      }
    }
  }
  .agency-price-config-card {
    margin-bottom: 10px;
    margin-left: 100px;
    width: 570px;
    .el-card__header {
      padding: 10px;
      font-size: 13px;
      font-weight: bolder;
    }
    .el-card__body {
      padding: 10px 0;
    }
  }
}
</style>

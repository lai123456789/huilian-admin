<script>
import {
  getCompanyCusContractTemplateById,
  saveCompanyCusContractTemplate,
  updateCompanyCusContractTemplate
} from '@/api/company/company-cus-contract-template'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'

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

const form = {
  // 基本信息
  tradeMode: '',
  templateName: '',
  status: enums.ENABLE_DISABLE.getFieldByKey('ENABLED'),
  principalId: 0,
  principalName: '',
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
}
const cargoSettleObj = {
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
}
const agencySettleObj = {
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
}
const taxSettleObj = {
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
}

export default {
  name: 'EnterForm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    this.columns = [
      {
        field: 'currencyName',
        title: '出口币别',
        width: 150,
        type: 'custom',
        rules: [{ required: true, message: '出口币别必填' }],
        customRender: (h, { row, column }) => {
          return (
            <business-autocomplete-basic
              vModel={row[column.field]}
              size="mini"
              module-name={constant.AUTOCOMPLETE_KEY_CURRENCY}
              label="出口币别"
            />
          )
        }
      },
      {
        field: 'costMoney',
        width: 150,
        title: '出口金额',
        type: 'inputNumber',
        rules: [{ required: true, message: '出口金额必填' }],
        attrs: {
          precision: 2
        }
      },
      {
        field: 'proxyFee',
        width: 150,
        title: '服务费',
        type: 'inputNumber',
        attrs: {
          precision: 3
        }
      }
    ]

    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      // 货款约定
      cargoSettleObj: clone(cargoSettleObj, true),
      // 服务费约定
      agencySettleObj: clone(agencySettleObj, true),
      // 税费约定
      taxSettleObj: clone(taxSettleObj, true),
      rules: {
        tradeMode: [{ required: true, message: '贸易模式必填' }],
        principalName: [{ required: true, message: '签约主体名称必填' }],
        cargoAdvanceFlag: [{ required: true, message: '是否垫付必填' }]
      },
      dicts: {},
      cargoHappenDates: [],
      agencyHappenDates: [],
      taxHappenDates: [],
      days: getDays(),
      weeks: getWeeks()
    }
  },
  computed: {
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
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.getFormData()
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    getFormData() {
      this.$nextTick(() => {
        this.form = clone(form, true)
        this.getFormInstance().resetFields()
        const type = this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')
        const {
          DICTS_ENABLE_DISABLE,
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
        Promise.all([
          getDataDictionary([
            DICTS_ENABLE_DISABLE,
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
          type && getCompanyCusContractTemplateById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          this.handleReceivableStarteDay(this.dicts[constant.DICTS_RECEIVABLE_STARTE_DAY])
          if (type) {
            Object.assign(this.form, this.handleDataAssemble(info.data || {}, 'get'))
          }
        })
      })
    },
    // 数据组装
    handleDataAssemble(formData, type = 'submit') {
      // 数据提交时，对数据结构进行处理
      if (type === 'submit') {
        const {
          id,
          tradeMode,
          principalId,
          templateName,
          status,
          remark,
          // 汇率约定
          exchangeRateType,
          exchangeRateTime,
          cargoRateType,
          taxRateType,
          // 滞纳金约定
          overdueRate,
          interestFreeDay,
          // 货款约定
          cargoAdvanceFlag,
          cargoInterestDay,
          cargoAdvanceRateType,
          cargoAdvanceRate,
          depositRate,
          cargoHappenDate,
          cargoSettlementMode,
          // 服务费约定
          agencyCollectFlag,
          agencyMark,
          agencyPriceConfig,
          agencyRate,
          extraAgencyMinFee,
          agencyMinFee,
          agencyHappenDate,
          agencySettlementMode,
          agencyFormula,

          // 税费约定
          taxAdvanceFlag,
          taxActualFlag,
          taxHappenDate,
          taxSettlementMode,
          taxCifTariffFormula,
          taxFobTariffFormula,
          taxExciseFormula,
          taxVatFormula,
          // 附件条件
          deliveryFlag,
          invoiceFlag,
          refundTaxFlag,
          agencyFeeFlag,
          otherFeeFlag
        } = formData

        const companyCusContractSaveDTO = {
          id: id || void 0,
          tradeMode,
          templateName,
          status,
          principalId,
          remark,
          // 汇率约定
          companyCusContractTemplateDetailRateDTO: {
            exchangeRateType,
            exchangeRateTime,
            cargoRateType,
            taxRateType
          },
          // 滞纳金约定
          companyCusContractTemplateDetailOverdueDTO: {
            // 把百分数转成小数
            overdueRate: new BigNumber(overdueRate).div(100).toNumber(),
            interestFreeDay
          },
          // 货款约定
          companyCusContractTemplateDetailCargoDTO: {
            cargoAdvanceFlag,
            cargoInterestDay,
            cargoAdvanceRateType,
            // 把百分数转成小数
            cargoAdvanceRate: new BigNumber(cargoAdvanceRate).div(100).toNumber(),
            depositRate: new BigNumber(depositRate).div(100).toNumber(),
            cargoHappenDate,
            cargoSettlementMode,
            // 货款：结算方式
            companyCusSettlementDayTemplateDTOList: this.cargoSettleObj.settleState.map(v => {
              return Object.assign(
                {
                  feeType: enums.COST_MOLD.getFieldByKey('CARGO'),
                  accountDay: this.cargoSettleObj.paymentDays.accountDay,
                  monthNumber: this.cargoSettleObj.monthlyState.monthNumber,
                  monthDay: this.cargoSettleObj.monthlyState.monthDay,
                  weekDay: this.cargoSettleObj.weekState.weekDay,
                  weekNumber: this.cargoSettleObj.weekState.weekNumber
                  // 结算方式为结账日时，用后面的 monthNumber， monthDay 覆盖前面的值
                },
                cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT') ? v : {}
              )
            })
          },
          // 服务费约定
          companyCusContractTemplateDetailAgencyDTO: {
            agencyCollectFlag,
            agencyMark,
            agencyPriceConfig,
            // 把百分数转成小数，保留2位
            agencyRate: new BigNumber(agencyRate).div(100).toNumber(),
            extraAgencyMinFee,
            agencyMinFee,
            agencyHappenDate,
            agencySettlementMode,
            agencyFormula,
            // 服务费：结算方式
            companyCusSettlementDayDTOList: this.agencySettleObj.settleState.map(v => {
              return Object.assign(
                {
                  feeType: enums.COST_MOLD.getFieldByKey('CARGO'),
                  accountDay: this.agencySettleObj.paymentDays.accountDay,
                  monthNumber: this.agencySettleObj.monthlyState.monthNumber,
                  monthDay: this.agencySettleObj.monthlyState.monthDay,
                  weekDay: this.agencySettleObj.weekState.weekDay,
                  weekNumber: this.agencySettleObj.weekState.weekNumber
                  // 结算方式为结账日时，用后面的 monthNumber， monthDay 覆盖前面的值
                },
                agencySettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT') ? v : {}
              )
            })
          },
          // 税费约定
          companyCusContractTemplateDetailTaxDTO: {
            taxAdvanceFlag,
            taxActualFlag,
            taxHappenDate,
            taxSettlementMode,
            taxCifTariffFormula,
            taxFobTariffFormula,
            taxExciseFormula,
            taxVatFormula,
            // 税费：结算方式
            companyCusSettlementDayDTOList: this.taxSettleObj.settleState.map(v => {
              return Object.assign(
                {
                  feeType: enums.COST_MOLD.getFieldByKey('CARGO'),
                  accountDay: this.taxSettleObj.paymentDays.accountDay,
                  monthNumber: this.taxSettleObj.monthlyState.monthNumber,
                  monthDay: this.taxSettleObj.monthlyState.monthDay,
                  weekDay: this.taxSettleObj.weekState.weekDay,
                  weekNumber: this.taxSettleObj.weekState.weekNumber
                  // 结算方式为结账日时，用后面的 monthNumber， monthDay 覆盖前面的值
                },
                taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT') ? v : {}
              )
            })
          },
          // 附件条件
          companyCusContractTemplateDetailOtherDTO: {
            deliveryFlag,
            invoiceFlag,
            refundTaxFlag,
            agencyFeeFlag,
            otherFeeFlag
          }
        }

        if (this.getAgencyPriceConfigGridInstance()) {
          const agencyPriceConfig = this.getAgencyPriceConfigGridInstance().getRecords()
          const agencyPriceConfigs = agencyPriceConfig.map(v => {
            const { currencyName, costMoney, proxyFee } = v
            return {
              currencyName,
              costMoney,
              proxyFee
            }
          })
          Object.assign(companyCusContractSaveDTO.companyCusContractDetailAgencyDTO, {
            agencyPriceConfig: agencyPriceConfig.length > 0 ? agencyPriceConfigs : []
          })
        }
        return companyCusContractSaveDTO
        // 数据获取时，对数据结构进行处理
      } else if (type === 'get') {
        // companyCusContractDetailVO: 包含了服务费、货款、税款的数据
        // companyCusSettlementDayVOList: 包含了服务费、货款、税款结算方式的数据组
        const { companyCusContractTemplateDetailVO, companyCusSettlementDayTemplateVOList, overdueRate } = formData
        const { agencySettlementMode, cargoSettlementMode, taxSettlementMode } = companyCusContractTemplateDetailVO
        const _companyCusContractDetailVO = { ...companyCusContractTemplateDetailVO }
        const { cargoInterestDay, cargoAdvanceRate, depositRate, agencyRate, agencyPriceConfig } = _companyCusContractDetailVO
        if (companyCusSettlementDayTemplateVOList && companyCusSettlementDayTemplateVOList.length > 0) {
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

          companyCusSettlementDayTemplateVOList.forEach(v => {
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
        delete formData.companyCusContractTemplateDetailVO
        delete formData.companyCusSettlementDayTemplateVOList

        this.$nextTick(() => {
          if (this.getAgencyPriceConfigGridInstance()) {
            this.getAgencyPriceConfigGridInstance().loadColumns(this.columns)
            this.getAgencyPriceConfigGridInstance().loadData(agencyPriceConfig || [], 'cover')
          }
        })

        return Object.assign(_companyCusContractDetailVO, formData)
      }
    },
    handleTradeModeChange(value) {
      // 清空之前的选项，除了贸易模式的值
      this.form = Object.assign(clone(form, true), { tradeMode: value, templateName: this.form.templateName })

      /* 更新应收起记日数据 */
      this.handleReceivableStarteDay(this.dicts[constant.DICTS_RECEIVABLE_STARTE_DAY])

      // 清空之前的校验
      this.clearValidate()
      // 货款约定
      this.cargoSettleObj = clone(cargoSettleObj, true)
      // 服务费约定
      this.agencySettleObj = clone(agencySettleObj, true)
      // 税费约定
      this.taxSettleObj = clone(taxSettleObj, true)
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
    handleCargoAdvanceFlagChange() {
      Object.assign(this.form, {
        depositRate: 0,
        cargoAdvanceRate: 0,
        cargoInterestDay: enums.INTEREST_METHOD.getFieldByKey('DAY'),
        cargoHappenDate: '',
        cargoSettlementMode: ''
      })
      this.cargoSettleObj = clone(cargoSettleObj, true)
    },
    handleAgencyMarksChange() {
      Object.assign(this.form, {
        agencyCollectFlag: enums.WHETHER_STATUS.getFieldByKey('YES'),
        agencyPriceConfig: [],
        agencyRate: 0,
        extraAgencyMinFee: '',
        agencyMinFee: '',
        agencyHappenDate: '',
        agencySettlementMode: '',
        agencyFormula: ''
      })

      this.$nextTick(() => {
        if (this.getAgencyPriceConfigGridInstance()) {
          this.getAgencyPriceConfigGridInstance()
            .loadColumns(this.columns)
            .then(() => {
              this.getAgencyPriceConfigGridInstance().loadData([])
            })
        }
      })
    },
    // 清空校验
    clearValidate() {
      this.getFormInstance().clearValidate()
      if (this.getAgencyPriceConfigGridInstance()) {
        this.getAgencyPriceConfigGridInstance().clearValidate()
      }
    },
    // 保证金比例的校验规则
    depositRateRules(flag) {
      return flag
        ? [
            { required: true, message: '保证金比例必填', validator: validatorNumRequired },
            { pattern: /^(\d?\d(\.\d*)?)$/, message: `请输入小于100的值` }
          ]
        : []
    },
    // 结算方式删除
    handleDelSettlementModeRow(obj, idx) {
      this[obj].settleState.splice(idx, 1)
    },
    // 结算方式新增
    handleAddSettlementModeRow(obj) {
      this[obj].settleState.push({
        businessBeginDay: '',
        businessEndDay: '',
        monthNumber: '',
        monthDay: ''
      })
    },
    handleSaveValidate() {
      return new Promise((resolve, reject) => {
        this.getFormInstance().validate((valid, invalidFields) => {
          if (valid) {
            if (this.getAgencyPriceConfigGridInstance()) {
              this.getAgencyPriceConfigGridInstance().validate(valids => {
                if (valids) {
                  const { rowIndex, rule } = valids
                  reject()
                  return this.$message.error(`服务费比价配置: 第${rowIndex + 1}行 ${rule.message}`)
                }
                resolve({ form: this.handleDataAssemble(clone(this.form, true)) })
              })
            } else {
              resolve({ form: this.handleDataAssemble(clone(this.form, true)) })
            }
          } else {
            // 通过 el-message 的形式展示错误信息
            this.getFormInstance().useErrorByMessage(invalidFields)
            reject()
          }
        })
      })
    },
    handleSave(done) {
      this.handleSaveValidate()
        .then(({ form }) => {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveCompanyCusContractTemplate(form)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}成功`)
                this.visible = false
                done()
                this.reLoad(false)
              })
              .catch(() => {
                done()
              })
          } else {
            updateCompanyCusContractTemplate(form)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}成功`)
                this.visible = false
                done()
                // 刷新表格的时候，保存之前选中的数据
                this.reLoad(true)
              })
              .catch(() => {
                done()
              })
          }
        })
        .catch(() => {
          done()
        })
    },
    getFormInstance() {
      return this.$refs.formRef
    },
    getAgencyPriceConfigGridInstance() {
      return this.$refs.agencyPriceConfigGrid
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="98%"
    custom-class="common-form-dialog cus-contract-template-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="模板名称" prop="templateName">
              <base-input v-model="form.templateName" placeholder="请输入模板名称" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="状态" prop="status">
              <base-select v-model="form.status" placeholder="请选择状态" :options="dicts[constant.DICTS_ENABLE_DISABLE]" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="贸易模式" prop="tradeMode">
              <base-select
                v-model="form.tradeMode"
                placeholder="请选择贸易模式"
                :options="dicts[constant.DICTS_TRADE_MODE]"
                @change="handleTradeModeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="签约主体名称" prop="principalName">
              <business-autocomplete-basic
                v-model="form.principalName"
                label="签约主体名称"
                placeholder="请输入签约主体名称"
                :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                :auto-assign="{
                  principalId: 'id'
                }"
                :form="form"
                @clear="() => (form.principalId = 0)"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <template v-if="form.tradeMode !== ''">
        <!-- 汇率约定 -->
        <div v-if="hideRateAgree" class="common-form-block">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            汇率约定
          </span>
          <base-row :gutter="10">
            <base-col :span="6">
              <base-form-item label="外汇牌价类型" prop="exchangeRateType">
                <base-select
                  v-model="form.exchangeRateType"
                  :clearable="false"
                  placeholder="请选择外汇牌价类型"
                  :options="dicts[constant.DICTS_FOREIGN_PRICE_TYPE]"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="外汇牌价时间" prop="exchangeRateTime">
                <base-time-picker
                  v-model="form.exchangeRateTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择外汇牌价时间"
                ></base-time-picker>
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
                    :clearable="false"
                    placeholder="请选择货款汇率类型"
                    :options="dicts[constant.DICTS_PAYMENT_EXCHANGE_RATE]"
                  />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="税款汇率类型" prop="taxRateType">
                  <base-select
                    v-model="form.taxRateType"
                    :clearable="false"
                    placeholder="请选择税款汇率类型"
                    :options="dicts[constant.DICTS_TAXES_EXCHANGE_RATE]"
                  />
                </base-form-item>
              </base-col>
            </template>
          </base-row>
        </div>

        <!-- 滞纳金约定 -->
        <div v-if="hideOverdueAgree" class="common-form-block">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            滞纳金约定
          </span>
          <base-row :gutter="10">
            <base-col :span="6">
              <base-form-item label="逾期费率" prop="exchangeRateType">
                <base-input-number v-model="form.overdueRate" placeholder="请输入逾期费率">
                  <template slot="append">%</template>
                </base-input-number>
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="免息天数" prop="interestFreeDay">
                <base-input-number v-model="form.interestFreeDay" placeholder="请输入免息天数" />
              </base-form-item>
            </base-col>
          </base-row>
        </div>

        <!-- 货款约定 -->
        <div v-if="hideCargo" class="common-form-block">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            货款约定
          </span>
          <base-row :gutter="10">
            <base-col v-if="form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')" :span="6">
              <base-form-item label="是否垫付" prop="cargoAdvanceFlag">
                <base-select
                  v-model="form.cargoAdvanceFlag"
                  :clearable="false"
                  placeholder="请选择是否垫付"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                  @change="handleCargoAdvanceFlagChange"
                />
              </base-form-item>
            </base-col>

            <template v-if="form.cargoAdvanceFlag === enums.WHETHER_STATUS.getFieldByKey('YES')">
              <base-col v-if="form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')" :span="6">
                <base-form-item
                  label="保证金比例"
                  prop="depositRate"
                  :rules="depositRateRules(form.cargoAdvanceFlag === enums.WHETHER_STATUS.getFieldByKey('YES'))"
                >
                  <base-input-number v-model="form.depositRate" placeholder="请输入保证金比例">
                    <template slot="append">%</template>
                  </base-input-number>
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="计息方式" prop="cargoInterestDay">
                  <base-select
                    v-model="form.cargoInterestDay"
                    :clearable="false"
                    placeholder="请选择计息方式"
                    :options="dicts[constant.DICTS_INTEREST_METHOD]"
                  />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="垫资费率" prop="cargoAdvanceRate">
                  <base-input-number v-model="form.cargoAdvanceRate" placeholder="请输入垫资费率">
                    <template slot="append">%</template>
                  </base-input-number>
                </base-form-item>
              </base-col>

              <base-col v-if="form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')" :span="6">
                <base-form-item label="应收起记日" prop="cargoHappenDate">
                  <base-select v-model="form.cargoHappenDate" placeholder="请选择应收起记日" :options="cargoHappenDates" />
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
                  placeholder="请选择结算方式"
                  :options="dicts[constant.DICTS_SETTLEMENT_MANNER]"
                />
              </base-form-item>
            </base-col>
            <base-col :xl="18" :lg="18" :md="16" :sm="12" :xs="24">
              <div v-if="form.cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('PAYMENT_DAYS')" class="receivable-starte-text">
                &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                  v-model="cargoSettleObj.paymentDays.accountDay"
                  :clearable="false"
                  size="small"
                  class="underline-input"
                />&nbsp;天收款
              </div>
              <div v-else-if="form.cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('MONTH')" class="receivable-starte-text">
                &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                  v-model="cargoSettleObj.monthlyState.monthNumber"
                  :clearable="false"
                  size="small"
                  class="underline-input"
                />&nbsp;个月的&nbsp;<base-select
                  v-model="cargoSettleObj.monthlyState.monthDay"
                  size="mini"
                  class="underline-select"
                  style="width: 80px"
                  :options="days"
                />&nbsp;号收款
              </div>
              <div v-else-if="form.cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('WEEK')" class="receivable-starte-text">
                &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                  v-model="cargoSettleObj.weekState.weekNumber"
                  :clearable="false"
                  size="small"
                  class="underline-input"
                />&nbsp;个周的星期&nbsp;<base-select
                  v-model="cargoSettleObj.weekState.weekDay"
                  size="mini"
                  class="underline-select"
                  style="width: 80px"
                  :options="weeks"
                />&nbsp;收款
              </div>
              <div v-else-if="form.cargoSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT')" class="receivable-starte-list">
                <template v-for="(item, index) in cargoSettleObj.settleState">
                  <div :key="`settleState_${index}`" class="receivable-starte-o">
                    <div class="receivable-starte-item">
                      {{ `${index + 1}.` }}&nbsp; 发生在当月&nbsp;<base-select
                        v-model="item.businessBeginDay"
                        size="mini"
                        class="underline-select"
                        style="width: 80px"
                        :options="days"
                      />&nbsp;号到&nbsp;<base-select
                        v-model="item.businessEndDay"
                        size="mini"
                        class="underline-select"
                        style="width: 80px"
                        :options="days"
                      />&nbsp;号的业务, 在之后的第&nbsp;<base-input-number
                        v-model="item.monthNumber"
                        :clearable="false"
                        size="small"
                        class="underline-input"
                      />&nbsp;个月的&nbsp;<base-select
                        v-model="item.monthDay"
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
        <div v-if="hideAgencyAgree" class="common-form-block">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            服务费约定
          </span>
          <base-row :gutter="10">
            <!--            <base-col v-if="form.tradeMode !== enums.TRADE_MODE.getFieldByKey('SALES_AGENT')" :span="6">-->
            <!--              <base-form-item label="是否收取" prop="agencyCollectFlag">-->
            <!--                <base-select-->
            <!--                  v-model="form.agencyCollectFlag"-->
            <!--                  :clearable="false"-->
            <!--                  placeholder="请选择是否收取"-->
            <!--                  :options="dicts[constant.DICTS_WHETHER_STATUS]"-->
            <!--                  @change="value => handleoCollectFlagChange(value, 'agencyCollectFlag')"-->
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
                    :clearable="false"
                    placeholder="请选择计费方式"
                    :options="dicts[constant.DICTS_AGENCY_MARK]"
                    @change="handleAgencyMarksChange"
                  />
                </base-form-item>
              </base-col>

              <base-col v-if="form.agencyMark === enums.AGENCY_MARK.getFieldByKey('RATIO')" :span="6">
                <base-form-item label="服务费率" prop="agencyRate">
                  <base-input-number v-model="form.agencyRate" placeholder="请输入服务费率">
                    <template slot="append">%</template>
                  </base-input-number>
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="最低消" prop="agencyMinFee">
                  <base-input-number v-model="form.agencyMinFee" placeholder="请输入最低消"> </base-input-number>
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="加收服务费" prop="extraAgencyMinFee">
                  <base-input-number v-model="form.extraAgencyMinFee" placeholder="请输入加收服务费"> </base-input-number>
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="应收起记日" prop="agencyHappenDate">
                  <base-select v-model="form.agencyHappenDate" placeholder="请选择应收起记日" :options="agencyHappenDates" />
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
                    placeholder="请选择结算方式"
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
                    :clearable="false"
                    size="small"
                    class="underline-input"
                  />&nbsp;个月的&nbsp;<base-select
                    v-model="agencySettleObj.monthlyState.monthDay"
                    size="mini"
                    class="underline-select"
                    style="width: 80px"
                    :options="days"
                  />&nbsp;号收款
                </div>
                <div v-else-if="form.agencySettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('WEEK')" class="receivable-starte-text">
                  &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                    v-model="agencySettleObj.weekState.weekNumber"
                    :clearable="false"
                    size="small"
                    class="underline-input"
                  />&nbsp;个周的星期&nbsp;<base-select
                    v-model="agencySettleObj.weekState.weekDay"
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
                          size="mini"
                          class="underline-select"
                          style="width: 80px"
                          :options="days"
                        />&nbsp;号到&nbsp;<base-select
                          v-model="item.businessEndDay"
                          size="mini"
                          class="underline-select"
                          style="width: 80px"
                          :options="days"
                        />&nbsp;号的业务, 在之后的第&nbsp;<base-input-number
                          v-model="item.monthNumber"
                          :clearable="false"
                          size="small"
                          class="underline-input"
                        />&nbsp;个月的&nbsp;<base-select
                          v-model="item.monthDay"
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
                    value-key="formula"
                    label="结算公式"
                    placeholder="请输入结算公式"
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
              <base-edit-table ref="agencyPriceConfigGrid" height="230px" :name="constant.TABLE_NAME_CONTRACT_AGENCY_PRICE_ENTER" />
            </el-card>
          </div>
        </div>

        <!-- 税费约定 -->
        <div v-if="hideTaxAgree" class="common-form-block">
          <span class="common-form-block-header">
            <i class="icon el-icon-s-grid"></i>
            税费约定
          </span>
          <base-row :gutter="10">
            <base-col :span="6">
              <base-form-item label="是否垫付" prop="taxAdvanceFlag">
                <base-select v-model="form.taxAdvanceFlag" :clearable="false" :options="dicts[constant.DICTS_WHETHER_STATUS]" />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="是否实缴实收" prop="taxActualFlag">
                <base-select
                  v-model="form.taxActualFlag"
                  :clearable="false"
                  :disabled="form.tradeMode === enums.TRADE_MODE.getFieldByKey('IMPORT_AGENT')"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="应收起记日" prop="taxHappenDate">
                <base-select v-model="form.taxHappenDate" placeholder="请选择应收起记日" :options="taxHappenDates" />
              </base-form-item>
            </base-col>
          </base-row>

          <base-row :gutter="10">
            <base-col :span="6">
              <base-form-item label="结算方式" prop="taxSettlementMode">
                <base-select
                  v-model="form.taxSettlementMode"
                  placeholder="请选择结算方式"
                  :options="dicts[constant.DICTS_SETTLEMENT_MANNER]"
                />
              </base-form-item>
            </base-col>
            <base-col :xl="18" :lg="18" :md="16" :sm="12" :xs="24">
              <div v-if="form.taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('PAYMENT_DAYS')" class="receivable-starte-text">
                &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                  v-model="taxSettleObj.paymentDays.accountDay"
                  :clearable="false"
                  size="small"
                  class="underline-input"
                />&nbsp;天收款
              </div>
              <div v-else-if="form.taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('MONTH')" class="receivable-starte-text">
                &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                  v-model="taxSettleObj.monthlyState.monthNumber"
                  :clearable="false"
                  size="small"
                  class="underline-input"
                />&nbsp;个月的&nbsp;<base-select
                  v-model="taxSettleObj.monthlyState.monthDay"
                  size="mini"
                  class="underline-select"
                  style="width: 80px"
                  :options="days"
                />&nbsp;号收款
              </div>
              <div v-else-if="form.taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('WEEK')" class="receivable-starte-text">
                &nbsp;在费用起记日，之后的第&nbsp;<base-input-number
                  v-model="taxSettleObj.weekState.weekNumber"
                  :clearable="false"
                  size="small"
                  class="underline-input"
                />&nbsp;个周的星期&nbsp;<base-select
                  v-model="taxSettleObj.weekState.weekDay"
                  size="mini"
                  class="underline-select"
                  style="width: 80px"
                  :options="weeks"
                />&nbsp;收款
              </div>
              <div v-else-if="form.taxSettlementMode === enums.SETTLEMENT_MANNER.getFieldByKey('ACCOUNT')" class="receivable-starte-list">
                <template v-for="(item, index) in taxSettleObj.settleState">
                  <div :key="`settleState_${index}`" class="receivable-starte-o">
                    <div class="receivable-starte-item">
                      {{ `${index + 1}.` }}&nbsp; 发生在当月&nbsp;<base-select
                        v-model="item.businessBeginDay"
                        size="mini"
                        class="underline-select"
                        style="width: 80px"
                        :options="days"
                      />&nbsp;号到&nbsp;<base-select
                        v-model="item.businessEndDay"
                        size="mini"
                        class="underline-select"
                        style="width: 80px"
                        :options="days"
                      />&nbsp;号的业务, 在之后的第&nbsp;<base-input-number
                        v-model="item.monthNumber"
                        :clearable="false"
                        size="small"
                        class="underline-input"
                      />&nbsp;个月的&nbsp;<base-select
                        v-model="item.monthDay"
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
                    value-key="formula"
                    label="CIF关税"
                    placeholder="请输入CIF关税"
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
                    value-key="formula"
                    label="FOB关税"
                    placeholder="请输入FOB关税"
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
                    value-key="formula"
                    label="消费税"
                    placeholder="请输入消费税"
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
                    value-key="formula"
                    label="增值税"
                    placeholder="请输入增值税"
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
        <div v-if="hideAdditionalAgree" class="common-form-block">
          <span class="common-form-block-header">
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
                  <base-select v-model="form.deliveryFlag" placeholder="请选择出货条件" :options="dicts[constant.DICTS_DELIVERY_FLAG]" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="开票条件" prop="invoiceFlag">
                  <base-select v-model="form.invoiceFlag" placeholder="请选择开票条件" :options="dicts[constant.DICTS_INVOICE_FLAG]" />
                </base-form-item>
              </base-col>
            </template>

            <template v-else>
              <base-col :span="6">
                <base-form-item label="退税款支付条件" prop="refundTaxFlag">
                  <base-select
                    v-model="form.refundTaxFlag"
                    placeholder="请选择退税款支付条件"
                    :options="dicts[constant.DICTS_REFUND_TAX_FLAG]"
                  />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="服务费收取方式" prop="agencyFeeFlag">
                  <base-select
                    v-model="form.agencyFeeFlag"
                    placeholder="请选择服务费收取方式"
                    :options="dicts[constant.DICTS_AGENCY_FEE_FLAG]"
                  />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="杂费收取方式" prop="otherFeeFlag">
                  <base-select
                    v-model="form.otherFeeFlag"
                    placeholder="请选择杂费收取方式"
                    :options="dicts[constant.DICTS_OTHER_FEE_FLAG]"
                  />
                </base-form-item>
              </base-col>
            </template>
          </base-row>
        </div>
      </template>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.cus-contract-template-dialog {
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
    margin-left: 115px;
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

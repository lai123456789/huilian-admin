<script>
import { clone } from 'xe-utils'
import enums from '@/enums'
import constant from '@/constant'
import OtherWrapType from './other-wrap-type'
import EnterFormWrite from './enter-form-write'
import PriceDescription from './price-description'
import BusMatter from './bus-matter'
import User from './user'
import Qualifications from './qualifications'
import InspectionCustomsElement from './inspection-customs-element'
import BigNumber from '@/utils/big-number'

const form = {
  customMaster: '',
  customMasterCode: void 0,
  declareStatus: '',
  seqNo: '',
  preEntryId: '',
  entryId: '',
  iEPort: '',
  iEPortCode: void 0,
  manualNo: '',
  contrNo: '',
  contrNoCheck: false,
  iEDate: '',
  declareDate: '',

  tradeCoScc: '',
  tradeCode: '',
  tradeCiqCode: '',
  tradeName: '',

  overseasConsignorCode: '',
  overseasConsignorEname: '',

  ownerCodeScc: '',
  ownerCode: '',
  ownerCiqCode: '',
  ownerName: '',

  agentCodeScc: '',
  agentCode: '',
  declCiqCode: '',
  agentId: 0,
  agentName: '',

  trafModeName: '',
  trafName: '',
  cargoListNo: '',
  cargoListNoCheck: false,

  billNo: '',
  billNoCheck: false,
  tradeMode: '',
  tradeModeCode: void 0,
  cutMode: '',
  cutModeCode: void 0,

  licenseNo: '',
  tradeCountry: '',
  tradeCountryCode: void 0,
  distinatePort: '',
  distinatePortCode: void 0,
  transMode: '',
  transModeCode: void 0,
  feeInsurRate: 0,

  feeCurr: '',
  feeCurrCode: void 0,
  feeMark: '',
  feeRate: 0,

  insurCurr: '',
  insurCurrCode: void 0,
  insurMark: '',
  insurRate: 0,

  otherCurr: '',
  otherCurrCode: void 0,
  otherMark: '',
  otherRate: 0,
  packNo: 0,

  wrapType: '',
  wrapTypeCode: void 0,
  grossWeight: 0,
  netWeight: 0,

  tradeArea: '',
  tradeAreaCode: void 0,
  entyPort: '',
  entyPortCode: void 0,
  goodsPlace: '',
  despPort: '',
  despPortCode: void 0,
  entryType: '',
  noteS: '',
  markNo: '',
  orgName: '',
  orgCode: void 0,
  vsaOrgName: '',
  vsaOrgCode: void 0,
  inspOrgName: '',
  inspOrgCode: void 0,
  despDate: '',
  blNo: '',
  purpOrgName: '',
  purpOrgCode: void 0,
  origBoxFlag: '',
  correlationNo: '',
  correlationReasonFlag: '',

  qualificationsCode: '',
  qualificationsName: '',
  powerSupplyDocs: '',

  promiseItmesOne: '',
  promiseItmesTwo: '',
  promiseItmesThree: '',
  promiseItmesFour: '',
  promiseItmesFive: '',
  promiseItmesSix: '',

  typeOne: '',
  typeTwo: '',
  typeFour: '',
  typeThree: '',
  typeSix: '',
  typeSeven: '',

  declaratioMaterialCode: '',
  declaratioMaterialCommitment: false,
  customsMasterUserVOList: [],
  customsMasterQualificationsList: []
}

export default {
  name: 'DetailsMaster',
  components: {
    OtherWrapType,
    EnterFormWrite,
    PriceDescription,
    BusMatter,
    User,
    Qualifications,
    InspectionCustomsElement
  },
  props: {
    orderType: {
      type: String,
      default: enums.IEF_LAG.getFieldByKey('IMPORT')
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      enums,
      constant,
      isExpand: false,
      otherWrapType: {
        visible: false
      },
      enterFormWrite: {
        visible: false,
        row: {
          field: '',
          value: '',
          label: '',
          title: ''
        }
      },
      priceDes: {
        visible: false,
        row: {}
      },
      busMatter: {
        visible: false,
        row: {}
      },
      user: {
        visible: false
      },
      qualifications: {
        visible: false,
        index: 0
      },
      inspectionCustomsElement: {
        visible: false
      },
      dicts: {},
      defaultConfig: {},
      form: clone(form, true),
      rules: {
        customMaster: [{ required: true, message: '申报地海关必填' }],
        iEPort: [{ required: true, message: `${this.orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '进境关别' : '出境关别'}必填` }],
        overseasConsignorEname: [{ required: true, message: '企业名称(外文)必填' }],
        tradeMode: [{ required: true, message: '监管方式必填' }],
        tradeCountry: [
          { required: true, message: this.orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '启运国(地区)必填' : '运抵国(地区)必填' }
        ],
        distinatePort: [
          { required: true, message: this.orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '经停港必填' : '指运港必填' }
        ],
        tradeArea: [{ required: true, message: '贸易国别(地区)必填' }],
        despPort: [{ required: true, message: '启运港必填' }],
        entryType: [{ required: true, message: '报关单类型必填' }],
        markNo: [{ required: true, message: '标记唛码必填' }]
      }
    }
  },
  computed: {
    feeCurrRules() {
      return [{ required: this.form.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE'), message: '运费币制必填' }]
    },
    insurCurrRules() {
      return [
        {
          required: this.form.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE'),
          message: '保险费费币制必填'
        }
      ]
    },
    otherCurrRules() {
      return [{ required: this.form.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE'), message: '杂费币制必填' }]
    }
  },
  watch: {
    writeVisible(value) {
      if (!value) {
        this.$nextTick(() => {
          this.form[this.writeField] = this.$refs.writeRef.getForm()[this.writeField]
        })
      }
    }
  },
  methods: {
    // 获取父级的数据
    setData(form, dicts, defaultConfig) {
      const {
        feeMark,
        feeRate,
        insurMark,
        insurRate,
        otherMark,
        otherRate,
        declaratioMaterialCode,
        customsTransportVO,
        customsMasterCopLimitVOList
      } = form
      const { cargoListNo, trafModeCode, trafModeName, trafName } = customsTransportVO || {}
      Object.assign(this.form, form, {
        cargoListNo,
        trafModeCode,
        trafModeName,
        trafName,
        customsMasterQualificationsList: customsMasterCopLimitVOList,
        feeRate: feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? new BigNumber(feeRate || 0).times(100).toNumber() : feeRate,
        insurRate:
          insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? new BigNumber(insurRate || 0).times(100).toNumber() : insurRate,
        otherRate: otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? new BigNumber(otherRate || 0).times(100).toNumber() : otherRate
      })
      this.dicts = dicts
      this.defaultConfig = defaultConfig
      this.initQualifications(customsMasterCopLimitVOList || [], declaratioMaterialCode, this.defaultConfig)
    },

    handleAgentNameClear() {
      Object.assign(this.form, {
        agentId: 0,
        agentCodeScc: '',
        agentCode: '',
        declCiqCode: ''
      })
    },

    handleIncotermsBeforeInput() {
      Object.assign(this.form, {
        feeInsurRate: 0,
        feeCurr: '',
        feeCurrCode: void 0,
        feeMark: '',
        feeRate: 0,
        insurCurr: '',
        insurCurrCode: void 0,
        insurMark: '',
        insurRate: 0,
        otherCurr: '',
        otherCurrCode: void 0,
        otherMark: '',
        otherRate: 0
      })
    },
    handleIncotermsSelect(rows) {
      const { name } = rows[0]
      if (name === 'CIF') {
        Object.assign(this.form, {
          feeInsurRate: 0,
          feeCurr: '',
          feeCurrCode: void 0,
          feeMark: '',
          feeRate: 0,
          insurCurr: '',
          insurCurrCode: void 0,
          insurMark: '',
          insurRate: 0,
          otherCurr: '',
          otherCurrCode: void 0,
          otherMark: '',
          otherRate: 0
        })
      } else if (name === 'FOB') {
        Object.assign(this.form, {
          feeInsurRate: 0,
          feeCurr: '',
          feeCurrCode: void 0,
          feeMark: '1',
          feeRate: 0,
          insurCurr: '',
          insurCurrCode: void 0,
          insurMark: '1',
          insurRate: 0,
          otherCurr: '',
          otherCurrCode: void 0,
          otherMark: '1',
          otherRate: 0
        })
      }
    },

    handleMarkChange(type) {
      if (type === 'fee') {
        Object.assign(this.form, {
          feeRate: 0,
          feeCurr: '',
          feeCurrCode: void 0
        })
      } else if (type === 'insur') {
        Object.assign(this.form, {
          insurRate: 0,
          insurCurr: '',
          insurCurrCode: void 0
        })
      } else if (type === 'other') {
        Object.assign(this.form, {
          otherRate: 0,
          otherCurr: '',
          otherCurrCode: void 0
        })
      }
    },
    handleExpand(isExpand) {
      this.isExpand = isExpand
    },
    handleOtherWrapType() {
      this.otherWrapType.visible = true
    },
    handleOtherWrapTypeCellDbClick({ row }) {
      const { name, code } = row
      Object.assign(this.form, {
        wrapType: name,
        wrapTypeCode: code
      })
      this.otherWrapType.visible = false
    },
    handleOpenWrite(type) {
      if (this.disabled) return
      if (type === 'noteS') {
        this.enterFormWrite.row = { field: type, value: this.form[type], label: '备注', title: '备注' }
      } else {
        this.enterFormWrite.row = { field: type, value: this.form[type], label: '标记唛码', title: '标记唛码' }
      }
      this.enterFormWrite.visible = true
    },
    handleOpenPriceDes() {
      const { promiseItmesOne, promiseItmesTwo, promiseItmesThree, promiseItmesFour, promiseItmesFive } = this.form
      this.priceDes = {
        visible: true,
        row: {
          promiseItmesOne,
          promiseItmesTwo,
          promiseItmesThree,
          promiseItmesFour,
          promiseItmesFive
        }
      }
    },
    handlePriceDesSave(form, done) {
      Object.assign(this.form, form)
      done()
      this.priceDes.visible = false
    },
    handleBusMatter() {
      const { typeOne, typeTwo, typeFour, typeThree, typeSix, typeSeven } = this.form
      this.busMatter = {
        visible: true,
        row: { typeOne, typeTwo, typeFour, typeThree, typeSix, typeSeven }
      }
    },
    handleBusMatterSave(form, done) {
      Object.assign(this.form, form)
      done()
      this.busMatter.visible = false
    },
    handleUser() {
      this.user.visible = true
      this.$refs.userRef.createTable(this.form.customsMasterUserVOList)
    },
    // 使用人表格新增和删除时会触发
    getUserRecords(records) {
      this.form.customsMasterUserVOList = records
    },
    // 初始化企业资质的值
    initQualifications(records, declaratioMaterialCode, defaultConfig) {
      this.qualifications.index = 0
      this.form.declaratioMaterialCommitment = !!declaratioMaterialCode
      const { customsQualifPromise } = defaultConfig
      this.defaultCommitments = [
        this.orderType === enums.IEF_LAG.getFieldByKey('IMPORT')
          ? {
              entQualifName: customsQualifPromise.importName,
              entQualifTypeCode: customsQualifPromise.importCode
            }
          : {
              entQualifName: customsQualifPromise.exportName,
              entQualifTypeCode: customsQualifPromise.exportCode
            }
      ]
      if (this.form.declaratioMaterialCommitment) {
        records = [...records, ...this.defaultCommitments]
      }
      this.getQualificationsRecords(records, declaratioMaterialCode, this.form.declaratioMaterialCommitment)
    },
    handleQualificationsClick() {
      this.qualifications.visible = true
      this.$refs.qualificationsRef.createTable(this.form.customsMasterQualificationsList, this.defaultCommitments)
    },
    getQualificationsRecords(records, declaratioMaterialCode, commitment) {
      this.form.customsMasterQualificationsList = records
      this.form.declaratioMaterialCode = declaratioMaterialCode
      this.form.declaratioMaterialCommitment = commitment
      this.qualifications.index = 0
      if (records.length > 0) {
        this.handleQualificationsAssaign(records[this.qualifications.index])
      }
    },
    handleQualificationsPrev() {
      if (this.form.customsMasterQualificationsList.length === 0) return this.$message.error('没有可查看的数据')
      if (this.qualifications.index <= 0) {
        this.$message.error('已经是第一条了')
      } else {
        this.qualifications.index--
        this.handleQualificationsAssaign(this.form.customsMasterQualificationsList[this.qualifications.index])
      }
    },
    handleQualificationsNext() {
      if (this.form.customsMasterQualificationsList.length === 0) return this.$message.error('没有可查看的数据')
      if (this.qualifications.index >= this.form.customsMasterQualificationsList.length - 1) {
        this.$message.error('已经是最后一条了')
      } else {
        this.qualifications.index++
        this.handleQualificationsAssaign(this.form.customsMasterQualificationsList[this.qualifications.index])
      }
    },
    handleQualificationsAssaign(record) {
      const { entQualifTypeCode, entQualifName } = record
      this.form.qualificationsCode = entQualifTypeCode
      this.form.qualificationsName = entQualifName
    },
    handleInspectionCustomsElement() {
      this.inspectionCustomsElement.visible = true
    },
    handleUpperCase(value, type) {
      if (!this.form[type]) return
      if (value) {
        this.form[type] = this.form[type].toUpperCase()
      } else {
        this.form[type] = this.form[type].toLowerCase()
      }
    },
    clearFormValidate() {
      this.getFormInstance().clearValidate()
    },
    getFormInstance() {
      return this.$refs.formRef
    }
  }
}
</script>

<template>
  <div class="mian-form relative">
    <base-form ref="formRef" :disabled="disabled" :rules="rules" :model="form" size="mini">
      <table class="percent-100">
        <tbody>
          <tr>
            <td class="td-scale-01 text-align-right">申报地海关</td>
            <td class="td-scale-02" colspan="3">
              <base-form-item class="non-empty" prop="customMaster">
                <business-autocomplete-ccl
                  v-model="form.customMaster"
                  :disabled="disabled"
                  label="申报地海关"
                  placeholder="请输入申报地海关"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_CUSTOMS"
                  :auto-assign="{
                    customMasterCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.customMasterCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td :class="['td-scale-03', 'text-align-right', { 'export-type': orderType === 'export' }]">申报状态</td>
            <td class="td-scale-04" colspan="3">
              <base-form-item prop="declareStatus">
                <base-select v-model="form.declareStatus" disabled :options="dicts[constant.DICTS_DECLARATION_STATUS]" />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">统一编号</td>
            <td colspan="3">
              <base-form-item prop="seqNo">
                <base-input v-model="form.seqNo" :clearable="false" disabled />
              </base-form-item>
            </td>
            <td class="text-align-right">预录入编号</td>
            <td colspan="3">
              <base-form-item prop="preEntryId">
                <base-input v-model="form.preEntryId" :clearable="false" disabled />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">海关编号</td>
            <td colspan="3">
              <base-form-item prop="entryId">
                <base-input v-model="form.entryId" :clearable="false" disabled />
              </base-form-item>
            </td>
            <td v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')" class="text-align-right">进境关别</td>
            <td v-else class="text-align-right">出境关别</td>
            <td colspan="3">
              <base-form-item class="non-empty" prop="iEPort">
                <business-autocomplete-ccl
                  v-model="form.iEPort"
                  :disabled="disabled"
                  :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '进境关别' : '出境关别'"
                  :placeholder="`请输入${orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '进境关别' : '出境关别'}`"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_CUSTOMS"
                  :auto-assign="{
                    iEPortCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.iEPortCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
          </tr>
          <tr>
            <template v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')">
              <td class="text-align-right">已实施预防性消毒</td>
              <td class="td-scale-05">
                <base-form-item prop="promiseItmesSix">
                  <base-select
                    v-model="form.promiseItmesSix"
                    placeholder="请选择"
                    clearable
                    :options="dicts[constant.DICTS_WHETHER_STATUS]"
                  />
                </base-form-item>
              </td>
              <td class="text-align-right td-scale-06">备案号</td>
              <td class="td-scale-05">
                <base-form-item prop="manualNo">
                  <base-input v-model="form.manualNo" :clearable="false" />
                </base-form-item>
              </td>
            </template>

            <template v-else>
              <td class="text-align-right">备案号</td>
              <td colspan="3">
                <base-form-item prop="manualNo">
                  <base-input v-model="form.manualNo" :clearable="false" />
                </base-form-item>
              </td>
            </template>

            <td class="text-align-right">合同协议号</td>
            <td colspan="3">
              <div class="flex">
                <base-form-item prop="contrNo" class="flex-1">
                  <base-input v-model="form.contrNo" :clearable="false" />
                </base-form-item>
                <div class="checkbox-wrap">
                  <el-checkbox v-model="form.contrNoCheck" @change="value => handleUpperCase(value, 'contrNo')"></el-checkbox>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')" class="text-align-right">进口日期</td>
            <td v-else class="text-align-right">出口日期</td>
            <td colspan="3">
              <base-form-item prop="iEDate">
                <base-date-picker v-model="form.iEDate" :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">申报日期</td>
            <td colspan="3">
              <base-form-item prop="declareDate">
                <base-date-picker v-model="form.declareDate" disabled :clearable="false" />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">境内收发货人</td>
            <td colspan="2">
              <base-form-item prop="tradeCoScc">
                <base-input v-model="form.tradeCoScc" :clearable="false" placeholder="18位社会信用代码" />
              </base-form-item>
            </td>
            <td colspan="2">
              <div class="flex">
                <base-form-item prop="tradeCode" class="flex-1">
                  <base-input v-model="form.tradeCode" :clearable="false" placeholder="10位海关代码" />
                </base-form-item>
                <base-form-item prop="tradeCiqCode" class="flex-1 border-l">
                  <base-input v-model="form.tradeCiqCode" :clearable="false" placeholder="10位检验检疫编码" />
                </base-form-item>
              </div>
            </td>
            <td colspan="3">
              <base-form-item prop="tradeName">
                <base-input v-model="form.tradeName" disabled :clearable="false" placeholder="企业名称(中文)" />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">境外收发货人</td>
            <td colspan="4">
              <base-form-item prop="overseasConsignorCode">
                <base-input v-model="form.overseasConsignorCode" :clearable="false" placeholder="境外收发货人代码" />
              </base-form-item>
            </td>
            <td colspan="3">
              <base-form-item class="non-empty" prop="overseasConsignorEname">
                <business-autocomplete-basic
                  v-model="form.overseasConsignorEname"
                  :disabled="disabled"
                  label="企业名称(外文)"
                  :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL_EN"
                  placeholder="请输入企业名称(外文)"
                  :params="{
                    companyRegion: enums.COMPANY_REGION.getFieldByKey('ABROAD')
                  }"
                ></business-autocomplete-basic>
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')" class="text-align-right">消费使用单位</td>
            <td v-else class="text-align-right">生产消费单位</td>
            <td colspan="2">
              <base-form-item prop="ownerCodeScc">
                <base-input v-model="form.ownerCodeScc" :clearable="false" placeholder="18位社会信用代码" />
              </base-form-item>
            </td>
            <td colspan="2">
              <div class="flex">
                <base-form-item prop="ownerCode" class="flex-1">
                  <base-input v-model="form.ownerCode" :clearable="false" placeholder="10位海关代码" />
                </base-form-item>
                <base-form-item prop="ownerCiqCode" class="flex-1 border-l">
                  <base-input v-model="form.ownerCiqCode" :clearable="false" placeholder="10位检验检疫编码" />
                </base-form-item>
              </div>
            </td>
            <td colspan="3">
              <base-form-item prop="ownerName">
                <base-input v-model="form.ownerName" disabled :clearable="false" placeholder="企业名称" />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">申报单位</td>
            <td colspan="2">
              <base-form-item prop="agentCodeScc">
                <base-input v-model="form.agentCodeScc" :clearable="false" placeholder="18位社会信用代码" />
              </base-form-item>
            </td>
            <td colspan="2">
              <div class="flex">
                <base-form-item prop="agentCode" class="flex-1">
                  <base-input v-model="form.agentCode" :clearable="false" placeholder="10位海关代码" />
                </base-form-item>
                <base-form-item prop="declCiqCode" class="flex-1 border-l">
                  <base-input v-model="form.declCiqCode" :clearable="false" placeholder="10位检验检疫编码" />
                </base-form-item>
              </div>
            </td>
            <td colspan="3">
              <base-form-item prop="agentName">
                <business-autocomplete-basic
                  v-model="form.agentName"
                  label="企业名称"
                  :disabled="disabled"
                  placeholder="请输入企业名称"
                  :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMS"
                  :auto-assign="{
                    agentId: 'id',
                    agentCodeScc: 'creditCode',
                    agentCode: 'customsCode',
                    declCiqCode: 'inspectionCode'
                  }"
                  :form="form"
                  @clear="handleAgentNameClear"
                />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">运输方式</td>
            <td class="td-scale-05">
              <base-form-item prop="trafModeName">
                <base-input v-model="form.trafModeName" disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right td-scale-06">运输工具名称</td>
            <td class="td-scale-05">
              <base-form-item prop="trafName">
                <base-input v-model="form.trafName" disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">航次号</td>
            <td colspan="3">
              <div class="flex">
                <base-form-item prop="cargoListNo" class="flex-1">
                  <base-input v-model="form.cargoListNo" disabled :clearable="false" />
                </base-form-item>
              </div>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">提运单号</td>
            <td colspan="3">
              <div class="flex">
                <base-form-item prop="billNo" class="non-empty flex-1">
                  <base-input v-model="form.billNo" :clearable="false" />
                </base-form-item>
                <div class="checkbox-wrap">
                  <el-checkbox v-model="form.billNoCheck" @change="value => handleUpperCase(value, 'billNo')"></el-checkbox>
                </div>
              </div>
            </td>
            <td class="text-align-right">监管方式</td>
            <td class="percent-13">
              <base-form-item class="non-empty" prop="tradeMode">
                <business-autocomplete-ccl
                  v-model="form.tradeMode"
                  label="监管方式"
                  :disabled="disabled"
                  placeholder="请输入监管方式"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRADE"
                  :auto-assign="{
                    tradeModeCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.tradeModeCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td class="percent-7 text-align-right">征免性质</td>
            <td>
              <base-form-item prop="cutMode">
                <business-autocomplete-ccl
                  v-model="form.cutMode"
                  :disabled="disabled"
                  label="征免性质"
                  placeholder="请输入征免性质"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_LEVY_TYPE"
                  :auto-assign="{
                    cutModeCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.cutModeCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">许可证号</td>
            <td>
              <base-form-item prop="licenseNo">
                <base-input v-model="form.licenseNo" :clearable="false" />
              </base-form-item>
            </td>
            <td v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')" class="text-align-right">启运国(地区)</td>
            <td v-else class="text-align-right">运抵国(地区)</td>
            <td>
              <base-form-item class="non-empty" prop="tradeCountry">
                <business-autocomplete-ccl
                  v-model="form.tradeCountry"
                  :disabled="disabled"
                  :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '启运国(地区)' : '运抵国(地区)'"
                  :placeholder="`请输入${orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '启运国(地区)' : '运抵国(地区)'}`"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                  :auto-assign="{
                    tradeCountryCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.tradeCountryCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')" class="text-align-right">经停港</td>
            <td v-else class="text-align-right">指运港</td>
            <td>
              <base-form-item class="non-empty" prop="distinatePort">
                <business-autocomplete-ccl
                  v-model="form.distinatePort"
                  :clearable="false"
                  :disabled="disabled"
                  :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '经停港' : '指运港'"
                  :placeholder="`请输入${orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '经停港' : '指运港'}`"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                  :auto-assign="{
                    distinatePortCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.distinatePortCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td class="text-align-right">成交方式</td>
            <td>
              <base-form-item prop="transMode">
                <business-autocomplete-ccl
                  v-model="form.transMode"
                  disabled
                  :clearable="false"
                  label="成交方式"
                  placeholder="请输入成交方式"
                  :before-input="handleIncotermsBeforeInput"
                  :show-more="false"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSACTION_MODE"
                  @select="handleIncotermsSelect"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
          </tr>
          <tr>
            <template v-if="form.transMode === 'CIF'">
              <td class="text-align-right">运保费比例</td>
              <td colspan="5">
                <base-form-item prop="feeInsurRate">
                  <base-input-number v-model="form.feeInsurRate" :precision="4" :clearable="false" />
                </base-form-item>
              </td>
            </template>

            <template v-else>
              <td class="text-align-right">运费</td>
              <td>
                <div class="form-group">
                  <base-form-item style="width: 35px" prop="feeMark">
                    <base-select
                      v-model="form.feeMark"
                      :clearable="false"
                      :disabled="disabled"
                      :options="dicts[constant.DICTS_CUS_MARK_TYPE]"
                      @change="value => handleMarkChange('fee', value)"
                    />
                  </base-form-item>
                  <base-form-item style="width: 40px" class="border-l" prop="feeRate">
                    <base-input-number
                      v-model="form.feeRate"
                      :precision="form.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? 4 : 2"
                    />
                  </base-form-item>
                  <base-form-item
                    style="flex: 1"
                    :class="['border-l', { 'non-empty': form.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE') }]"
                    prop="feeCurr"
                    :rules="feeCurrRules"
                  >
                    <business-autocomplete-ccl
                      v-model="form.feeCurr"
                      :disabled="disabled ? disabled : form.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')"
                      :show-more="false"
                      label="币制"
                      placeholder="请输入币制"
                      :auto-assign="{
                        feeCurrCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_CURRENCY"
                      @clear="() => (form.feeCurrCode = '')"
                    >
                      <template v-slot="{ option }">
                        <span>{{ `${option.code} ${option.name}` }}</span>
                      </template>
                    </business-autocomplete-ccl>
                  </base-form-item>
                </div>
              </td>
              <td class="text-align-right">保险费</td>
              <td>
                <div class="form-group">
                  <base-form-item style="width: 35px" prop="insurMark">
                    <base-select
                      v-model="form.insurMark"
                      :clearable="false"
                      :disabled="disabled"
                      :options="dicts[constant.DICTS_CUS_MARK_TYPE]"
                      @change="value => handleMarkChange('insur', value)"
                    />
                  </base-form-item>
                  <base-form-item style="width: 40px" class="border-l" prop="insurRate">
                    <base-input-number
                      v-model="form.insurRate"
                      :precision="form.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? 4 : 2"
                    />
                  </base-form-item>
                  <base-form-item
                    style="flex: 1"
                    :class="['border-l', { 'non-empty': form.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE') }]"
                    prop="insurCurr"
                    :rules="insurCurrRules"
                  >
                    <business-autocomplete-ccl
                      v-model="form.insurCurr"
                      :disabled="disabled ? disabled : form.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')"
                      :show-more="false"
                      label="币制"
                      placeholder="请输入币制"
                      :auto-assign="{
                        insurCurrCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_CURRENCY"
                      @clear="() => (form.insurCurrCode = '')"
                    >
                      <template v-slot="{ option }">
                        <span>{{ `${option.code} ${option.name}` }}</span>
                      </template>
                    </business-autocomplete-ccl>
                  </base-form-item>
                </div>
              </td>
              <td class="text-align-right">杂费</td>
              <td>
                <div class="form-group">
                  <base-form-item style="width: 35px" prop="otherMark">
                    <base-select
                      v-model="form.otherMark"
                      :clearable="false"
                      :disabled="disabled"
                      :options="dicts[constant.DICTS_CUS_MARK_TYPE]"
                      @change="value => handleMarkChange('other', value)"
                    />
                  </base-form-item>
                  <base-form-item style="width: 40px" class="border-l" prop="otherRate">
                    <base-input-number
                      v-model="form.otherRate"
                      :precision="form.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? 4 : 2"
                    />
                  </base-form-item>
                  <base-form-item
                    style="flex: 1"
                    :class="['border-l', { 'non-empty': form.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE') }]"
                    prop="otherCurr"
                    :rules="otherCurrRules"
                  >
                    <business-autocomplete-ccl
                      v-model="form.otherCurr"
                      :disabled="disabled ? disabled : form.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')"
                      :show-more="false"
                      label="币制"
                      placeholder="请输入币制"
                      :auto-assign="{
                        otherCurrCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_CURRENCY"
                      @clear="() => (form.otherCurrCode = '')"
                    >
                      <template v-slot="{ option }">
                        <span>{{ `${option.code} ${option.name}` }}</span>
                      </template>
                    </business-autocomplete-ccl>
                  </base-form-item>
                </div>
              </td>
            </template>

            <td class="text-align-right">件数</td>
            <td>
              <base-form-item prop="packNo">
                <base-input-number v-model="form.packNo" :clearable="false" />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">包装种类</td>
            <td colspan="2" style="border-right: 0">
              <base-form-item prop="wrapType">
                <business-autocomplete-ccl
                  v-model="form.wrapType"
                  :disabled="disabled"
                  label="包装种类"
                  :is-more="false"
                  :clearable="false"
                  placeholder="请输入包装种类"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_WRAP_TYPE"
                  :auto-assign="{
                    wrapTypeCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.wrapTypeCode = '')"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td>
              <!--其他包装  -->
              <div class="flex">
                <button class="btn flex-1" type="button" :disabled="disabled" @click="handleOtherWrapType">其他包装</button>
              </div>
            </td>
            <td class="text-align-right">毛重(KG)</td>
            <td>
              <base-form-item prop="grossWeight">
                <base-input-number v-model="form.grossWeight" :precision="5" :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">净重(KG)</td>
            <td>
              <base-form-item prop="netWeight">
                <base-input-number v-model="form.netWeight" :clearable="false" />
              </base-form-item>
            </td>
          </tr>

          <tr>
            <td class="text-align-right">贸易国别(地区)</td>
            <td>
              <base-form-item class="non-empty" prop="tradeArea">
                <business-autocomplete-ccl
                  v-model="form.tradeArea"
                  :disabled="disabled"
                  :clearable="false"
                  label="贸易国别(地区)"
                  placeholder="请输入贸易国别(地区)"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                  :auto-assign="{
                    tradeAreaCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.tradeAreaCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td class="text-align-right">集装箱数</td>
            <td>
              <base-form-item>
                <base-input disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">随附单证</td>
            <td colspan="3">
              <base-form-item>
                <base-input disabled :clearable="false" />
              </base-form-item>
            </td>
          </tr>

          <tr v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')">
            <td class="text-align-right">入境口岸</td>
            <td>
              <base-form-item prop="entyPort">
                <business-autocomplete-ccl
                  v-model="form.entyPort"
                  :clearable="false"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE"
                  label="入境口岸"
                  placeholder="请选择入境口岸"
                  value-key="name"
                  :auto-assign="{
                    entyPortCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.entyPortCode = '')"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td class="text-align-right">货物存放地点</td>
            <td colspan="3">
              <base-form-item class="non-empty" prop="goodsPlace">
                <base-input v-model="form.goodsPlace" :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">启运港</td>
            <td>
              <base-form-item class="non-empty" prop="despPort">
                <business-autocomplete-ccl
                  v-model="form.despPort"
                  :disabled="disabled"
                  :clearable="false"
                  label="启运港"
                  placeholder="请输入启运港"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                  :auto-assign="{
                    despPortCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.despPortCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
          </tr>

          <tr v-else>
            <td class="text-align-right">货物存放地点</td>
            <td colspan="3">
              <base-form-item class="non-empty" prop="goodsPlace">
                <base-input v-model="form.goodsPlace" :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">离境口岸</td>
            <td colspan="3">
              <base-form-item class="non-empty" prop="entyPort">
                <business-autocomplete-ccl
                  v-model="form.entyPort"
                  :disabled="disabled"
                  :clearable="false"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE"
                  label="离境口岸"
                  placeholder="请选择离境口岸"
                  value-key="name"
                  :auto-assign="{
                    entyPortCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.entyPortCode = '')"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
          </tr>

          <tr>
            <td class="text-align-right">报关单类型</td>
            <td>
              <base-form-item class="non-empty" prop="entryType">
                <base-select v-model="form.entryType" clearable placeholder="请选择" :options="dicts[constant.DICTS_ENTER_TYPE]" />
              </base-form-item>
            </td>

            <td class="text-align-right">备注</td>
            <td colspan="4">
              <div class="flex">
                <base-form-item prop="noteS" class="flex-1">
                  <base-input v-model="form.noteS" :clearable="false" />
                </base-form-item>
                <div class="textarea">
                  <span
                    >(<span>{{ form.noteS.length }}</span
                    >字节)
                  </span>
                  <i class="icon el-icon-more" @click="handleOpenWrite('noteS')"></i>
                </div>
              </div>
            </td>
            <td rowspan="2">
              <div class="flex flex-col">
                <button class="btn m-b-2" type="button" :disabled="disabled" @click="handleOpenPriceDes">价格说明</button>
                <button class="btn" type="button" :disabled="disabled" @click="handleBusMatter">业务事项</button>
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div v-if="!isExpand" class="expand el-icon-arrow-right" @click="handleExpand(true)"></div>
              <div v-else class="expand el-icon-arrow-down" @click="handleExpand(false)"></div>
            </td>
            <td class="text-align-right">标记唛码</td>
            <td colspan="4">
              <div class="flex">
                <base-form-item prop="markNo" class="non-empty flex-1">
                  <base-input v-model="form.markNo" :clearable="false" />
                </base-form-item>
                <div class="textarea">
                  <span
                    >(<span>{{ form.markNo.length }}</span
                    >字节)
                  </span>
                  <i class="icon el-icon-more" @click="handleOpenWrite('markNo')"></i>
                </div>
              </div>
            </td>
          </tr>

          <template v-if="isExpand">
            <tr>
              <td class="text-align-right">检验检疫受理机关</td>
              <td colspan="3">
                <base-form-item prop="orgName">
                  <business-autocomplete-ccl
                    v-model="form.orgName"
                    :disabled="disabled"
                    :clearable="false"
                    :module-name="constant.AUTOCOMPLETE_KEY_CCL_ORG_CODE"
                    label="检验检疫受理机关"
                    placeholder="请选择检验检疫受理机关"
                    value-key="name"
                    :auto-assign="{
                      orgCode: 'code'
                    }"
                    :form="form"
                    @clear="() => (form.orgCode = '')"
                  >
                    <template v-slot="{ option }">
                      <span>{{ `${option.code} ${option.name}` }}</span>
                    </template>
                  </business-autocomplete-ccl>
                </base-form-item>
              </td>
              <td class="text-align-right">企业资质</td>
              <td colspan="3">
                <div class="flex">
                  <base-form-item style="width: 80px">
                    <base-input v-model="form.qualificationsCode" disabled :clearable="false" />
                  </base-form-item>
                  <base-form-item class="flex-1 border-l">
                    <base-input v-model="form.qualificationsName" disabled :clearable="false" />
                  </base-form-item>
                  <div class="ident-icon-wrap">
                    <i class="ident-icon el-icon-arrow-left" @click="handleQualificationsPrev"></i>
                    <i class="ident-icon el-icon-arrow-right" @click="handleQualificationsNext"></i>
                    <i class="ident-icon el-icon-more" @click="handleQualificationsClick"></i>
                  </div>
                </div>
              </td>
            </tr>

            <tr v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')">
              <td class="text-align-right">领证机关</td>
              <td>
                <base-form-item prop="vsaOrgName">
                  <business-autocomplete-ccl
                    v-model="form.vsaOrgName"
                    :disabled="disabled"
                    :clearable="false"
                    :module-name="constant.AUTOCOMPLETE_KEY_CCL_ORG_CODE"
                    label="领证机关"
                    placeholder="请选择领证机关"
                    value-key="name"
                    :auto-assign="{
                      vsaOrgCode: 'code'
                    }"
                    :form="form"
                    @clear="() => (form.vsaOrgCode = '')"
                  >
                    <template v-slot="{ option }">
                      <span>{{ `${option.code} ${option.name}` }}</span>
                    </template>
                  </business-autocomplete-ccl>
                </base-form-item>
              </td>
              <td class="text-align-right">口岸检验检疫机关</td>
              <td>
                <base-form-item prop="inspOrgName">
                  <business-autocomplete-ccl
                    v-model="form.inspOrgName"
                    :disabled="disabled"
                    :clearable="false"
                    :module-name="constant.AUTOCOMPLETE_KEY_CCL_ORG_CODE"
                    label="口岸检验检疫机关"
                    placeholder="请选择口岸检验检疫机关"
                    value-key="name"
                    :auto-assign="{
                      inspOrgCode: 'code'
                    }"
                    :form="form"
                    @clear="() => (form.inspOrgCode = '')"
                  >
                    <template v-slot="{ option }">
                      <span>{{ `${option.code} ${option.name}` }}</span>
                    </template>
                  </business-autocomplete-ccl>
                </base-form-item>
              </td>
              <td class="text-align-right">启运日期</td>
              <td>
                <base-form-item prop="despDate">
                  <base-date-picker v-model="form.despDate" :clearable="false" />
                </base-form-item>
              </td>
              <td class="text-align-right">B/L号</td>
              <td>
                <base-form-item prop="blNo">
                  <base-input v-model="form.blNo" :clearable="false" />
                </base-form-item>
              </td>
            </tr>

            <tr v-else>
              <td class="text-align-right">领证机关</td>
              <td colspan="3">
                <base-form-item prop="vsaOrgName">
                  <business-autocomplete-ccl
                    v-model="form.vsaOrgName"
                    :disabled="disabled"
                    :clearable="false"
                    :module-name="constant.AUTOCOMPLETE_KEY_CCL_ORG_CODE"
                    label="领证机关"
                    placeholder="请选择领证机关"
                    value-key="name"
                    :auto-assign="{
                      vsaOrgCode: 'code'
                    }"
                    :form="form"
                    @clear="() => (form.vsaOrgCode = '')"
                  >
                    <template v-slot="{ option }">
                      <span>{{ `${option.code} ${option.name}` }}</span>
                    </template>
                  </business-autocomplete-ccl>
                </base-form-item>
              </td>
              <td class="text-align-right" style="width: 80px">口岸检验检疫机关</td>
              <td colspan="3">
                <base-form-item prop="inspOrgName">
                  <business-autocomplete-ccl
                    v-model="form.inspOrgName"
                    :disabled="disabled"
                    :clearable="false"
                    :module-name="constant.AUTOCOMPLETE_KEY_CCL_ORG_CODE"
                    label="领证机关"
                    placeholder="请选择领证机关"
                    value-key="name"
                    :auto-assign="{
                      inspOrgCode: 'code'
                    }"
                    :form="form"
                    @clear="() => (form.inspOrgCode = '')"
                  >
                    <template v-slot="{ option }">
                      <span>{{ `${option.code} ${option.name}` }}</span>
                    </template>
                  </business-autocomplete-ccl>
                </base-form-item>
              </td>
            </tr>

            <tr>
              <td class="text-align-right">目的地检验检疫机关</td>
              <td>
                <base-form-item prop="purpOrgName">
                  <business-autocomplete-ccl
                    v-model="form.purpOrgName"
                    :disabled="disabled"
                    :clearable="false"
                    :module-name="constant.AUTOCOMPLETE_KEY_CCL_ORG_CODE"
                    label="领证机关"
                    placeholder="请选择领证机关"
                    value-key="name"
                    :auto-assign="{
                      purpOrgCode: 'code'
                    }"
                    :form="form"
                    @clear="() => (form.purpOrgCode = '')"
                  >
                    <template v-slot="{ option }">
                      <span>{{ `${option.code} ${option.name}` }}</span>
                    </template>
                  </business-autocomplete-ccl>
                </base-form-item>
              </td>
              <td class="text-align-right">关联号码及理由</td>
              <td colspan="2">
                <base-form-item prop="correlationNo">
                  <base-input v-model="form.correlationNo" :clearable="false" placeholder="关联号码" />
                </base-form-item>
              </td>
              <td colspan="2">
                <base-form-item prop="correlationReasonFlag">
                  <base-input v-model="form.correlationReasonFlag" :clearable="false" placeholder="关联理由" />
                </base-form-item>
              </td>
              <td class="text-align-center">
                <!-- 使用人 -->
                <div class="flex">
                  <button type="button" class="btn flex-1" @click="handleUser">使用人</button>
                </div>
              </td>
            </tr>
            <tr>
              <template v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')">
                <td class="text-align-right">原箱运输</td>
                <td>
                  <base-form-item prop="origBoxFlag">
                    <base-select
                      v-model="form.origBoxFlag"
                      placeholder="请选择"
                      clearable
                      :options="dicts[constant.DICTS_WHETHER_STATUS]"
                    />
                  </base-form-item>
                </td>
              </template>
              <td class="text-align-right">特殊业务标识</td>
              <td :colspan="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '0' : '3'">
                <base-form-item>
                  <base-input disabled :clearable="false" />
                </base-form-item>
              </td>
              <td class="text-align-right">所需单证</td>
              <td colspan="2">
                <div>
                  <base-form-item>
                    <base-input v-model="form.powerSupplyDocs" disabled :clearable="false" />
                  </base-form-item>
                </div>
              </td>
              <td class="text-align-center">
                <div class="flex">
                  <!-- <button type="button" class="btn flex-1" @click="handleInspectionCustomsElement">检验检疫签证申报要素</button> -->
                  <button type="button" class="btn flex-1">检验检疫签证申报要素</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </base-form>
    <other-wrap-type v-model="otherWrapType.visible" @cell-dblclick="handleOtherWrapTypeCellDbClick" />
    <enter-form-write ref="writeRef" v-model="enterFormWrite.visible" :table-row="enterFormWrite.row" />
    <price-description v-model="priceDes.visible" :table-row="priceDes.row" @save="handlePriceDesSave" />
    <bus-matter v-model="busMatter.visible" :table-row="busMatter.row" @save="handleBusMatterSave" />
    <user ref="userRef" v-model="user.visible" :disabled="disabled" @get-user-records="getUserRecords" />
    <qualifications
      ref="qualificationsRef"
      v-model="qualifications.visible"
      :disabled="disabled"
      :default-commitment="form.declaratioMaterialCommitment"
      @get-qualifications-records="getQualificationsRecords"
    />
    <inspection-customs-element ref="inspectionCustomsElementRef" v-model="inspectionCustomsElement.visible" :disabled="disabled" />
  </div>
</template>

<style lang="scss" scoped>
.mian-form {
  table,
  tr,
  td {
    border: 1px solid #b7b7b7;
  }
  tr > td {
    font-size: 12px;
  }
  .border-l {
    border-left: 1px solid #b7b7b7;
  }
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-1 {
    flex: 1 1 0%;
  }
  .relative {
    position: relative;
  }
  .border-collapse {
    border-collapse: collapse;
  }
  .percent-100 {
    width: 100%;
  }
  .percent-7 {
    width: 7%;
  }
  .percent-13 {
    width: 13%;
  }
  .text-align-right {
    padding-right: 2px;
    text-align: right;
  }
  .m-b-2 {
    margin-bottom: 2px;
  }
  .checkbox-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
  }
  .btn {
    padding: 0 2px;
    height: 24px;
    font-size: 12px;
    border: 0;
    border-radius: 4px;
    color: #ffffff;
    background-color: #096ac6;
    line-height: normal;
    cursor: pointer;
  }
  .textarea {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 4px;
    .icon {
      margin-left: 4px;
      width: 16px;
      height: 16px;
      font-size: 12px;
      border-radius: 50%;
      text-align: center;
      color: #ffffff;
      background-color: #096ac6;
      line-height: 16px;
      cursor: pointer;
    }
  }
  .ident-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 6px;
    .ident-icon {
      margin-left: 6px;
      width: 16px;
      height: 16px;
      font-size: 12px;
      border-radius: 50%;
      text-align: center;
      color: #ffffff;
      background-color: #096ac6;
      line-height: 16px;
      cursor: pointer;
    }
  }
  .expand {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1px 1px 1px 5px;
    width: 16px;
    height: 16px;
    border: 0;
    border-radius: 8px;
    color: #ffffff;
    background-color: #096ac6;
    line-height: normal;
    cursor: pointer;
  }
  .form-group {
    display: flex;
    ::v-deep .el-input__suffix {
      display: none;
    }
    ::v-deep .el-input--suffix .el-input__inner {
      padding-right: 4px !important;
      padding-left: 4px;
    }
    ::v-deep .drop-pop-input-inner {
      padding-right: 4px;
      padding-left: 4px;
    }
    ::v-deep .el-form-item {
      margin-bottom: 0;
    }
  }
  ::v-deep .el-form-item {
    margin-bottom: 0;
    .el-input__inner {
      padding-right: 4px !important;
      padding-left: 4px;
      border: none;
    }
    .el-date-editor--date {
      .el-input__inner {
        padding-left: 30px;
      }
    }
    &.is-error {
      border: 1px solid $--color-danger;
      box-sizing: border-box;
    }
    &.non-empty {
      .drop-pop-input-inner {
        background-color: #faffbd;
      }
      .el-input__inner {
        background-color: #faffbd;
      }
      .is-disabled {
        .drop-pop-input-inner {
          background-color: #f5f7fa;
        }
        .el-input__inner {
          background-color: #f5f7fa;
        }
      }
    }
  }
}

@media screen and (min-width: 1600px) {
  .td-scale-01 {
    width: 11%;
  }
  .td-scale-02 {
    width: 45%;
  }
  .td-scale-03 {
    width: 8%;
    &.export-type {
      width: 10%;
    }
  }
  .td-scale-04 {
    width: 40%;
  }
  .td-scale-05 {
    width: 17%;
  }
  .td-scale-06 {
    width: 12%;
  }
}

@media screen and (min-width: 1366px) and (max-width: 1599px) {
  .td-scale-01 {
    width: 13%;
  }
  .td-scale-02 {
    width: 42%;
  }
  .td-scale-03 {
    width: 9%;
    &.export-type {
      width: 11%;
    }
  }
  .td-scale-04 {
    width: 40%;
  }
  .td-scale-05 {
    width: 16%;
  }
  .td-scale-06 {
    width: 12%;
  }
}

@media screen and (min-width: 1100px) and (max-width: 1365px) {
  .td-scale-01 {
    width: 13%;
  }
  .td-scale-02 {
    width: 42%;
  }
  .td-scale-03 {
    width: 8%;
    &.export-type {
      width: 11%;
    }
  }
  .td-scale-04 {
    width: 40%;
  }
  .td-scale-05 {
    width: 14%;
  }
  .td-scale-06 {
    width: 12%;
  }
}

@media screen and (min-width: 750px) and (max-width: 1099px) {
  .td-scale-01 {
    width: 13%;
  }
  .td-scale-02 {
    width: 41%;
  }
  .td-scale-03 {
    width: 9%;
    &.export-type {
      width: 11%;
    }
  }
  .td-scale-04 {
    width: 34%;
  }
  .td-scale-05 {
    width: 12%;
  }
  .td-scale-06 {
    width: 15%;
  }
}
</style>

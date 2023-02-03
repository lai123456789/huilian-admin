<script>
import {
  getAcctLetterOfCreditIssuingById,
  saveAcctLetterOfCreditIssuing,
  updateAcctLetterOfCreditIssuing
} from '@/api/finance/acct-letter-of-credit-issuing'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
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
    rows: Array,
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
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        creditType: [{ required: true, message: '信用证类型必填' }],
        creditNo: [{ required: true, message: '信用证号必填' }],
        issuingBankName: [{ required: true, message: '开证行必填' }],
        issuingDate: [{ required: true, message: '开证日期必填' }],
        contractNo: [{ required: true, message: '合同号必填' }],
        beneficiaryCompanyType: [{ required: true, message: '受益人类型必填' }],
        beneficiaryCountry: [{ required: true, message: '受益人国家地区必填' }],
        beneficiaryCompanyName: [{ required: true, message: '受益人名称必填' }],
        applicantCompanyName: [{ required: true, message: '申请人名称必填' }],
        applicantCountry: [{ required: true, message: '申请人国家地区必填' }],
        currencyName: [{ required: true, message: '币别必填' }],
        expiryDate: [{ required: true, message: '有效期必填' }]
      },
      dicts: {},
      beneficiaryCompanyTypes: []
    }
  },
  computed: {
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
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_PAY_COMPANY_TYPE, DICTS_CREDIT_TYPE, DICTS_USANCE_FLAG } = constant
        Promise.all([
          getDataDictionary([DICTS_PAY_COMPANY_TYPE, DICTS_CREDIT_TYPE, DICTS_USANCE_FLAG]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctLetterOfCreditIssuingById(this.tableRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts
          this.beneficiaryCompanyTypes = this.dicts[DICTS_PAY_COMPANY_TYPE].filter(
            v => ![enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS')].includes(v.value)
          )
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              deliveryDate: [info.data.deliveryStartDate, info.data.deliveryEndDate]
            })
          }
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const formData = Object.assign(clone(this.form, true), {
            deliveryStartDate: this.form.deliveryDate && this.form.deliveryDate.length > 0 ? this.form.deliveryDate[0] : '',
            deliveryEndDate: this.form.deliveryDate && this.form.deliveryDate.length > 0 ? this.form.deliveryDate[1] : ''
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveAcctLetterOfCreditIssuing(formData)
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
            updateAcctLetterOfCreditIssuing(formData)
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
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
        }
      })
    },
    getFormInstance() {
      return this.$refs.formRef
    },
    getDetailsEditTableInstance() {
      return this.$refs.detailsEditTableRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="99%"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="111px" size="mini">
      <base-row>
        <base-col :span="6">
          <base-form-item label="信用证号" prop="creditNo">
            <base-input v-model="form.creditNo" placeholder="请输入信用证号" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="开证日期" prop="issuingDate">
            <base-date-picker v-model="form.issuingDate" type="date" placeholder="选择开证日期" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="信用证类型" prop="creditType">
            <base-select v-model="form.creditType" placeholder="请选择信用证类型" :options="dicts[constant.DICTS_CREDIT_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="开证行" prop="issuingBankName">
            <base-input v-model="form.issuingBankName" placeholder="请输入开证行" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="币别" prop="currencyName">
            <business-autocomplete-basic
              v-model="form.currencyName"
              label="币别"
              placeholder="请输入币别"
              :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="金额" prop="creditMoney">
            <base-input-number v-model="form.creditMoney" placeholder="请输入金额" :precision="2" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="合同号" prop="contractNo">
            <base-input v-model="form.contractNo" placeholder="请输入合同号" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="是否远期" prop="usanceFlag">
            <base-select
              v-model="form.usanceFlag"
              placeholder="请选择是否远期"
              :clearable="false"
              :options="dicts[constant.DICTS_USANCE_FLAG]"
              @change="() => (form.usanceDay = 0)"
            />
          </base-form-item>
        </base-col>

        <base-col v-if="form.usanceFlag === enums.USANCE_FLAG.getFieldByKey('FAR')" :span="6">
          <base-form-item label="远期天数" prop="usanceDay">
            <base-input-number v-model="form.usanceDay" placeholder="请输入远期天数" :precision="0" />
          </base-form-item>
        </base-col>
      </base-row>

      <base-row>
        <base-col :span="6">
          <base-form-item label="受益人类型" prop="beneficiaryCompanyType">
            <base-select v-model="form.beneficiaryCompanyType" placeholder="请选择受益人类型" :options="beneficiaryCompanyTypes" />
          </base-form-item>
        </base-col>

        <base-col v-if="form.beneficiaryCompanyType" :span="6">
          <base-form-item label="受益人" prop="beneficiaryCompanyName">
            <business-autocomplete-basic
              v-model="form.beneficiaryCompanyName"
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
            <base-input v-model="form.beneficiaryAddress" placeholder="请输入受益人地址" />
          </base-form-item>
        </base-col>
      </base-row>

      <base-row>
        <base-col :span="6">
          <base-form-item label="申请人" prop="applicantCompanyName">
            <base-input v-model="form.applicantCompanyName" placeholder="请输入申请人" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="申请人国家地区" prop="applicantCountry">
            <business-autocomplete-ccl
              v-model="form.applicantCountry"
              label="申请人国家地区"
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
            <base-input v-model="form.applicantAddress" placeholder="请输入申请人地址" />
          </base-form-item>
        </base-col>
      </base-row>

      <base-row>
        <base-col :span="6">
          <base-form-item label="有效期" prop="expiryDate">
            <base-date-picker v-model="form.expiryDate" type="date" placeholder="选择有效期" />
          </base-form-item>
        </base-col>

        <base-col :span="9">
          <base-form-item label="到单期限" prop="deliveryDate">
            <base-date-picker v-model="form.deliveryDate" type="daterange" placeholder="选择到单期限" />
          </base-form-item>
        </base-col>

        <base-col :span="9">
          <base-form-item label="有效期限地址" prop="expiryPlace">
            <base-input v-model="form.expiryPlace" placeholder="请输入有效期限地址" />
          </base-form-item>
        </base-col>
      </base-row>

      <base-row>
        <base-col :span="6">
          <base-form-item label="最迟装期" prop="shipmentDate">
            <base-input v-model="form.shipmentDate" placeholder="请输入最迟装期" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="货运国家地区" prop="shippingCountry">
            <business-autocomplete-ccl
              v-model="form.shippingCountry"
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
            <base-input v-model="form.shippingDesc" placeholder="请输入货运描述" />
          </base-form-item>
        </base-col>
      </base-row>

      <base-row>
        <base-col :span="6">
          <base-form-item label="运输方式" prop="transModeName">
            <business-autocomplete-ccl
              v-model="form.transModeName"
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
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<script>
import {
  getCompanySupplierById,
  isExistsCompanySupplierByCompanyId,
  saveCompanySupplier,
  updateCompanySupplier
} from '@/api/company/company-supplier'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  // 基本信息
  companyName: '',
  companyNameEn: '',
  businessRelation: '',
  companyNo: '',
  companyAddress: '',
  companyAddressEn: '',
  customerLevel: '',
  saleManName: '',
  saleManId: 0,
  tradeManName: '',
  tradeManId: 0,
  mobile: '',
  person: '',
  phone: '',
  remark: '',
  easNo: '',

  // 营业执照信息
  companyRegion: enums.COMPANY_REGION.getFieldByKey('DOMESTIC'),
  legalPerson: '',
  registerStatus: '',
  foundDate: '',
  registerCapital: '',
  paidInCapital: '',
  approvalDate: '',
  creditCode: '',
  organizationCode: '',
  registerNo: '',
  taxpayerIdentNo: '',
  imExCompanyCode: '',
  customsCode: '',
  inspectionCode: '',
  industry: '',
  companyType: '',
  businessTerm: '',
  registerAuthority: '',
  businessScope: ''
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
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        companyName: [{ required: true, message: '企业名称必填' }],
        saleManName: [{ required: true, message: '业务名称必填', trigger: 'blur' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const {
          DICTS_COMPANY_SUPPLIER_LEVEL,
          DICTS_COMPANY_REGION,
          DICTS_COMPANY_CUSTOMER_LEVEL,
          DICTS_COMPANY_REGISTER_STATUS,
          DICTS_COMPANY_TYPE
        } = constant
        Promise.all([
          getDataDictionary([
            DICTS_COMPANY_SUPPLIER_LEVEL,
            DICTS_COMPANY_REGION,
            DICTS_COMPANY_CUSTOMER_LEVEL,
            DICTS_COMPANY_REGISTER_STATUS,
            DICTS_COMPANY_TYPE
          ]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getCompanySupplierById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            const {
              id,
              companyId,
              companyNo,
              businessRelation,
              easNo,
              customerLevel,
              saleManId,
              saleManName,
              tradeManId,
              tradeManName,
              remark,
              companyInfoVO
            } = info.data
            const {
              id: companyInfoId,
              companyName,
              companyNameEn,
              companyAddress,
              companyAddressEn,
              legalPerson,
              mobile,
              person,
              phone,
              companyRegion,
              registerStatus,
              foundDate,
              registerCapital,
              paidInCapital,
              approvalDate,
              creditCode,
              organizationCode,
              registerNo,
              taxpayerIdentNo,
              customsCode,
              inspectionCode,
              imExCompanyCode,
              industry,
              companyType,
              businessTerm,
              registerAuthority,
              businessScope
            } = companyInfoVO
            Object.assign(this.form, {
              id,
              companyId,
              companyNo,
              companyName,
              companyNameEn,
              companyAddress,
              companyAddressEn,
              businessRelation,
              customerLevel,
              saleManId,
              saleManName,
              tradeManId,
              tradeManName,
              remark,
              legalPerson,
              mobile,
              person,
              phone,
              easNo,
              companyInfoId,
              companyRegion,
              registerStatus,
              foundDate,
              registerCapital,
              paidInCapital,
              approvalDate,
              creditCode,
              organizationCode,
              registerNo,
              taxpayerIdentNo,
              customsCode,
              inspectionCode,
              imExCompanyCode,
              industry,
              companyType,
              businessTerm,
              registerAuthority,
              businessScope
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
    async onCompanyNameSelect(rows) {
      this.form = clone(form, true)
      const { id } = rows[0]
      const res = await isExistsCompanySupplierByCompanyId(id)
      if (res.data) {
        this.$message.warning('客户已存在')
      }
      Object.assign(this.form, rows[0], { id: this.tableRow.id, companyId: id })
    },
    onCompanyNameClear() {
      this.form = clone(form, true)
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const formData = this.handleSubmitForm(this.form)
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveCompanySupplier(formData)
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
            updateCompanySupplier(formData)
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
    // 处理提交表单的数据
    handleSubmitForm(form) {
      const {
        id,
        businessRelation,
        customsCode,
        inspectionCode,
        customerLevel,
        companyName,
        companyNameEn,
        remark,
        saleManId,
        saleManName,
        tradeManId,
        tradeManName,
        companyAddress,
        companyAddressEn,
        mobile,
        person,
        phone,
        approvalDate,
        businessScope,
        businessTerm,
        companyRegion,
        companyType,
        creditCode,
        foundDate,
        imExCompanyCode,
        industry,
        legalPerson,
        organizationCode,
        paidInCapital,
        registerAuthority,
        registerCapital,
        registerNo,
        registerStatus,
        taxpayerIdentNo
      } = form
      // 处理form数据结构
      const companyCustomerSaveDTO = {
        id: id || void 0,
        businessRelation,
        customerLevel,
        remark,
        saleManId,
        saleManName,
        tradeManId,
        tradeManName,
        companyInfoDTO: {
          approvalDate,
          businessScope,
          businessTerm,
          companyAddress,
          companyAddressEn,
          companyName,
          companyNameEn,
          companyRegion,
          companyType,
          mobile,
          person,
          phone,
          creditCode,
          foundDate,
          customsCode,
          inspectionCode,
          imExCompanyCode,
          industry,
          legalPerson,
          organizationCode,
          paidInCapital,
          registerAuthority,
          registerCapital,
          registerNo,
          registerStatus,
          taxpayerIdentNo
        }
      }
      return companyCustomerSaveDTO
    },
    getFormInstance() {
      return this.$refs.formRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="98%"
    custom-class="common-form-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="113px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')" :span="6">
            <base-form-item label="企业编号" prop="companyNo">
              <base-input v-model="form.companyNo" disabled placeholder="请输入企业编号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="企业名称" prop="companyName">
              <business-autocomplete-basic
                v-model="form.companyName"
                label="企业名称"
                placeholder="请输入企业名称"
                :is-exist="false"
                :module-name="constant.AUTOCOMPLETE_KEY_COMPANY"
                @select="onCompanyNameSelect"
                @clear="onCompanyNameClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="企业英文名称" prop="companyNameEn">
              <base-input v-model="form.companyNameEn" placeholder="请输入企业英文名称" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="企业地址" prop="companyAddress">
              <base-input v-model="form.companyAddress" placeholder="请输入企业地址" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="企业英文地址" prop="companyAddressEn">
              <base-input v-model="form.companyAddressEn" placeholder="请输入企业英文地址" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="联系人" prop="person">
              <base-input v-model="form.person" placeholder="请输入联系人" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="手机号" prop="mobile">
              <base-input v-model="form.mobile" placeholder="请输入手机号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="座机" prop="phone">
              <base-input v-model="form.phone" placeholder="请输入座机" />
            </base-form-item>
          </base-col>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="供应商分类" prop="customerLevel">
              <base-select
                v-model="form.customerLevel"
                placeholder="请选择供应商"
                :options="dicts[constant.DICTS_COMPANY_SUPPLIER_LEVEL]"
              />
            </base-form-item>
          </base-col>
        </base-row>
        <base-row :gutter="20">
          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 营业执照信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          营业执照信息
        </span>

        <base-row :gutter="20">
          <base-col :span="6">
            <base-form-item label="所属区域" prop="companyRegion">
              <base-select v-model="form.companyRegion" placeholder="请选择所属区域" :options="dicts[constant.DICTS_COMPANY_REGION]" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="法定代表人" prop="legalPerson">
              <base-input v-model="form.legalPerson" placeholder="请输入法定代表人" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="登记状态" prop="registerStatus">
              <base-select
                v-model="form.registerStatus"
                placeholder="请选择登记状态"
                :options="dicts[constant.DICTS_COMPANY_REGISTER_STATUS]"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="成立日期" prop="foundDate">
              <base-date-picker v-model="form.foundDate" placeholder="选择成立日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="注册资本" prop="registerCapital">
              <base-input v-model="form.registerCapital" placeholder="请输入注册资本" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="实缴资本" prop="paidInCapital">
              <base-input v-model="form.paidInCapital" placeholder="请输入实缴资本" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="核准日期" prop="approvalDate">
              <base-date-picker v-model="form.approvalDate" placeholder="选择核准日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="统一社会信用代码" prop="creditCode">
              <base-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="组织机构代码" prop="organizationCode">
              <base-input v-model="form.organizationCode" placeholder="请输入组织机构代码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="工商注册号" prop="registerNo">
              <base-input v-model="form.registerNo" placeholder="请输入工商注册号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="纳税人识别号" prop="taxpayerIdentNo">
              <base-input v-model="form.taxpayerIdentNo" placeholder="请输入纳税人识别号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="进出口企业代码" prop="imExCompanyCode">
              <base-input v-model="form.imExCompanyCode" placeholder="请输入进出口企业代码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="海关代码" prop="customsCode">
              <base-input v-model="form.customsCode" placeholder="请输入海关代码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="检验检疫代码" prop="inspectionCode">
              <base-input v-model="form.inspectionCode" placeholder="请输入检验检疫代码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="所属行业" prop="industry">
              <base-input v-model="form.industry" placeholder="请输入所属行业" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="企业类型" prop="companyType">
              <base-select v-model="form.companyType" placeholder="请选择企业类型" :options="dicts[constant.DICTS_COMPANY_TYPE]" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="营业期限" prop="businessTerm">
              <base-input v-model="form.businessTerm" placeholder="请输入营业期限" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="登记机关" prop="registerAuthority">
              <base-input v-model="form.registerAuthority" placeholder="请输入登记机关" />
            </base-form-item>
          </base-col>

          <base-col :span="12">
            <base-form-item label="经营范围" prop="businessScope">
              <base-input v-model="form.businessScope" type="textarea" placeholder="请输入经营范围" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>
    </base-form>
  </base-dialog>
</template>

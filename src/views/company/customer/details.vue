<script>
import { getCompanyCustomerById } from '@/api/company/company-customer'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import EasUpdateForm from './components/eas-update-form'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm, EasUpdateForm },
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
        companyName: '',
        companyNameEn: '',
        businessRelation: '',
        companyNo: '',
        companyAddress: '',
        companyAddressEn: '',
        customerLevel: '',
        saleManName: '',
        tradeManName: '',
        mobile: '',
        person: '',
        phone: '',
        remark: '',
        easNo: '',

        // 营业执照信息
        companyRegion: '0',
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
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      easUpdateForm: {
        visible: false
      },
      dicts: {},
      createForm: {
        createByName: '',
        createTime: ''
      },
      rightLabelWidth: '70px'
    }
  },
  mounted() {
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.loading = true
      const {
        DICTS_COMPANY_BUSINESS_RELA,
        DICTS_COMPANY_REGION,
        DICTS_COMPANY_CUSTOMER_LEVEL,
        DICTS_COMPANY_REGISTER_STATUS,
        DICTS_COMPANY_TYPE
      } = constant
      const [dicts, info] = await Promise.all([
        getDataDictionary([
          DICTS_COMPANY_BUSINESS_RELA,
          DICTS_COMPANY_REGION,
          DICTS_COMPANY_CUSTOMER_LEVEL,
          DICTS_COMPANY_REGISTER_STATUS,
          DICTS_COMPANY_TYPE
        ]),
        getCompanyCustomerById(this.tableRow.id)
      ])
      const {
        id,
        companyId,
        companyNo,
        createByName,
        createTime,
        easNo,
        businessRelation,
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
        companyShortName,
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
        companyShortName,
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
      this.dicts = dicts
      this.createForm = {
        createByName,
        createTime
      }
      if (cb) cb()
      this.loading = false
    },
    handleEdit() {
      this.enterForm.visible = true
    },
    handleDelete() {
      this.deleteFn()
    },
    handleEasUpdate() {
      this.easUpdateForm.visible = true
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
    class="common-operate customer-details"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <base-form ref="formRef" :model="form" label-width="113px" size="mini">
          <!-- 基本信息 -->
          <div class="common-operate-block">
            <span class="common-operate-block-header">
              <i class="icon el-icon-s-grid"></i>
              基本信息
            </span>
            <base-row :gutter="10">
              <base-col :span="6">
                <base-form-item label="企业编号" prop="companyNo">
                  <base-input v-model="form.companyNo" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业名称" prop="companyName">
                  <base-input v-model="form.companyName" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业简称" prop="companyShortName">
                  <base-input v-model="form.companyShortName" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业英文名称" prop="companyNameEn">
                  <base-input v-model="form.companyNameEn" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业地址" prop="companyAddress">
                  <base-input v-model="form.companyAddress" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业英文地址" prop="companyAddressEn">
                  <base-input v-model="form.companyAddressEn" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="联系人" prop="person">
                  <base-input v-model="form.person" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="手机号" prop="mobile">
                  <base-input v-model="form.mobile" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="座机" prop="phone">
                  <base-input v-model="form.phone" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="合作关系" prop="businessRelation">
                  <base-select
                    v-model="form.businessRelation"
                    disabled
                    placeholder=""
                    :options="dicts[constant.DICTS_COMPANY_BUSINESS_RELA]"
                  />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="客户分类" prop="customerLevel">
                  <base-select
                    v-model="form.customerLevel"
                    disabled
                    placeholder=""
                    :options="dicts[constant.DICTS_COMPANY_CUSTOMER_LEVEL]"
                  />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="业务名称" prop="saleManName">
                  <base-input v-model="form.saleManName" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="商务名称" prop="tradeManName">
                  <base-input v-model="form.tradeManName" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="12">
                <base-form-item label="备注" prop="remark">
                  <base-input v-model="form.remark" disabled type="textarea" />
                </base-form-item>
              </base-col>
            </base-row>
          </div>

          <!-- 营业执照信息 -->
          <div class="common-operate-block">
            <span class="common-operate-block-header">
              <i class="icon el-icon-s-grid"></i>
              营业执照信息
            </span>

            <base-row :gutter="10">
              <base-col :span="6">
                <base-form-item label="所属区域" prop="companyRegion">
                  <base-select v-model="form.companyRegion" disabled placeholder="" :options="dicts[constant.DICTS_COMPANY_REGION]" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="法定代表人" prop="legalPerson">
                  <base-input v-model="form.legalPerson" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="登记状态" prop="registerStatus">
                  <base-select
                    v-model="form.registerStatus"
                    disabled
                    placeholder=""
                    :options="dicts[constant.DICTS_COMPANY_REGISTER_STATUS]"
                  />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="成立日期" prop="foundDate">
                  <base-date-picker v-model="form.foundDate" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="注册资本" prop="registerCapital">
                  <base-input v-model="form.registerCapital" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="实缴资本" prop="paidInCapital">
                  <base-input v-model="form.paidInCapital" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="核准日期" prop="approvalDate">
                  <base-date-picker v-model="form.approvalDate" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="统一社会信用代码" prop="creditCode">
                  <base-input v-model="form.creditCode" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="组织机构代码" prop="organizationCode">
                  <base-input v-model="form.organizationCode" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="工商注册号" prop="registerNo">
                  <base-input v-model="form.registerNo" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="纳税人识别号" prop="taxpayerIdentNo">
                  <base-input v-model="form.taxpayerIdentNo" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="进出口企业代码" prop="imExCompanyCode">
                  <base-input v-model="form.imExCompanyCode" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="海关代码" prop="customsCode">
                  <base-input v-model="form.customsCode" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="检验检疫代码" prop="inspectionCode">
                  <base-input v-model="form.inspectionCode" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="所属行业" prop="industry">
                  <base-input v-model="form.industry" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业类型" prop="companyType">
                  <base-select v-model="form.companyType" disabled placeholder="" :options="dicts[constant.DICTS_COMPANY_TYPE]" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="营业期限" prop="businessTerm">
                  <base-input v-model="form.businessTerm" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="登记机关" prop="registerAuthority">
                  <base-input v-model="form.registerAuthority" disabled />
                </base-form-item>
              </base-col>

              <base-col :span="12">
                <base-form-item label="经营范围" prop="businessScope">
                  <base-input v-model="form.businessScope" disabled type="textarea" />
                </base-form-item>
              </base-col>
            </base-row>
          </div>
        </base-form>
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
        <el-button icon="el-icon-edit" type="warning" @click="handleEasUpdate">生成EAS编码</el-button>
        <el-button icon="el-icon-delete" type="danger" @click="handleDelete">删除</el-button>
        <el-button icon="el-icon-edit" type="warning" @click="handleEdit">编辑</el-button>
      </div>
    </div>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
    <eas-update-form v-model="easUpdateForm.visible" :table-row="{ id: tableRow.id, easNo: form.easNo }" :re-load="getDetailsData" />
  </div>
</template>

<style lang="scss">
.customer-details {
  .common-operate-l {
    width: calc(100% - 240px);
    &-main {
      overflow: auto;
    }
  }
}
</style>

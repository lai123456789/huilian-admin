<script>
import { getCompanyCustomsById } from '@/api/company/company-customs'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
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
        // 基本信息
        companyName: '',
        companyNameEn: '',
        businessRelation: '',
        companyNo: '',
        companyAddress: '',
        companyAddressEn: '',
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
      const { DICTS_COMPANY_REGION, DICTS_COMPANY_REGISTER_STATUS, DICTS_COMPANY_TYPE } = constant
      const [dicts, info] = await Promise.all([
        getDataDictionary([DICTS_COMPANY_REGION, DICTS_COMPANY_REGISTER_STATUS, DICTS_COMPANY_TYPE]),
        getCompanyCustomsById(this.tableRow.id)
      ])
      const { id, companyId, companyNo, createByName, createTime, remark, companyInfoVO } = info.data
      const {
        id: companyInfoId,
        customsCode,
        inspectionCode,
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
        customsCode,
        inspectionCode,
        $$companyId: id,
        companyNo,
        companyName,
        companyNameEn,
        companyAddress,
        companyAddressEn,
        remark,
        legalPerson,
        mobile,
        person,
        phone,
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
    class="common-operate customs-details"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <base-form ref="formRef" :model="form" disabled label-width="113px" size="mini">
          <!-- 基本信息 -->
          <div class="common-operate-block">
            <span class="common-operate-block-header">
              <i class="icon el-icon-s-grid"></i>
              基本信息
            </span>
            <base-row :gutter="10">
              <base-col :span="6">
                <base-form-item label="企业编号" prop="companyNo">
                  <base-input v-model="form.companyNo" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业名称" prop="companyName">
                  <base-input v-model="form.companyName" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业英文名称" prop="companyNameEn">
                  <base-input v-model="form.companyNameEn" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业地址" prop="companyAddress">
                  <base-input v-model="form.companyAddress" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业英文地址" prop="companyAddressEn">
                  <base-input v-model="form.companyAddressEn" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="联系人" prop="person">
                  <base-input v-model="form.person" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="手机号" prop="mobile">
                  <base-input v-model="form.mobile" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="座机" prop="phone">
                  <base-input v-model="form.phone" />
                </base-form-item>
              </base-col>
            </base-row>

            <base-row :gutter="20">
              <base-col :span="12">
                <base-form-item label="备注" prop="remark">
                  <base-input v-model="form.remark" type="textarea" />
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

            <base-row :gutter="20">
              <base-col :span="6">
                <base-form-item label="所属区域" prop="companyRegion">
                  <base-select v-model="form.companyRegion" placeholder="" :options="dicts[constant.DICTS_COMPANY_REGION]" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="法定代表人" prop="legalPerson">
                  <base-input v-model="form.legalPerson" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="登记状态" prop="registerStatus">
                  <base-select v-model="form.registerStatus" placeholder="" :options="dicts[constant.DICTS_COMPANY_REGISTER_STATUS]" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="成立日期" prop="foundDate">
                  <base-date-picker v-model="form.foundDate" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="注册资本" prop="registerCapital">
                  <base-input v-model="form.registerCapital" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="实缴资本" prop="paidInCapital">
                  <base-input v-model="form.paidInCapital" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="核准日期" prop="approvalDate">
                  <base-date-picker v-model="form.approvalDate" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="统一社会信用代码" prop="creditCode">
                  <base-input v-model="form.creditCode" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="组织机构代码" prop="organizationCode">
                  <base-input v-model="form.organizationCode" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="工商注册号" prop="registerNo">
                  <base-input v-model="form.registerNo" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="纳税人识别号" prop="taxpayerIdentNo">
                  <base-input v-model="form.taxpayerIdentNo" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="进出口企业代码" prop="imExCompanyCode">
                  <base-input v-model="form.imExCompanyCode" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="海关代码" prop="customsCode">
                  <base-input v-model="form.customsCode" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="检验检疫代码" prop="inspectionCode">
                  <base-input v-model="form.inspectionCode" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="所属行业" prop="industry">
                  <base-input v-model="form.industry" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="企业类型" prop="companyType">
                  <base-select v-model="form.companyType" placeholder="" :options="dicts[constant.DICTS_COMPANY_TYPE]" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="营业期限" prop="businessTerm">
                  <base-input v-model="form.businessTerm" />
                </base-form-item>
              </base-col>

              <base-col :span="6">
                <base-form-item label="登记机关" prop="registerAuthority">
                  <base-input v-model="form.registerAuthority" />
                </base-form-item>
              </base-col>

              <base-col :span="12">
                <base-form-item label="经营范围" prop="businessScope">
                  <base-input v-model="form.businessScope" type="textarea" />
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
        <el-button icon="el-icon-delete" type="danger" @click="handleDelete">删除</el-button>
        <el-button icon="el-icon-edit" type="warning" @click="handleEdit">编辑</el-button>
      </div>
    </div>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
  </div>
</template>

<style lang="scss">
.customs-details {
  .common-operate-l {
    width: calc(100% - 240px);
    &-main {
      overflow: auto;
    }
  }
}
</style>

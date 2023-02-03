<script>
import { getRiskCusQuotaRecordById, getRiskCusQuotaRecordAuditList, auditRiskCusQuotaRecord } from '@/api/risk/risk-cus-quota-record'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'
import EnterForm from './components/enter-form'

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
        auditStatus: void 0,
        companyName: '',
        companyAddress: '',
        phone: '',
        creditCode: '',
        organizationCode: '',
        registerNo: '',
        legalPerson: '',
        receiptFilePath1: '',
        receiptFilePath2: '',
        receiptFilePath3: ''
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      statusForm: {
        agreeStatus: ''
      },
      showBtns: {
        edit: false,
        del: false
      },
      dicts: {},
      rightLabelWidth: '70px',
      requestApi: {
        list: () => getRiskCusQuotaRecordAuditList(this.tableRow.id),
        save: auditRiskCusQuotaRecord
      },
      showAuditDetailsBtn: false
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_QUOTA_RECORD_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_QUOTA_TYPE, DICTS_GRANT_MODE } = constant
        Promise.all([getDataDictionary([DICTS_QUOTA_TYPE, DICTS_GRANT_MODE]), getRiskCusQuotaRecordById(this.tableRow.id)]).then(
          ([dicts, info]) => {
            const { status, createByName, createTime } = info.data
            this.dicts = dicts

            this.statusForm = {
              agreeStatus: status
            }

            this.createForm = {
              createByName,
              createTime
            }
            Object.assign(this.form, info.data)

            this.showBtns = {
              edit: this.permissions[constant.PERMISSION_QUOTA_RECORD_EDIT],
              del: this.permissions[constant.PERMISSION_QUOTA_RECORD_DEL]
            }

            if (isFunction(cb)) cb()
            this.loading = false
          }
        )
      })
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
    class="common-operate cus-quota-record is-details-adaptive"
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
          <base-form ref="formRef" :model="form" label-width="120px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="客户名称" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      disabled
                      label="客户名称"
                      placeholder="请输入客户名称"
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                      :auto-assign="{
                        customerId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="额度类型" prop="quotaType">
                    <base-select
                      v-model="form.quotaType"
                      disabled
                      placeholder="请选择额度类型"
                      :options="dicts[constant.DICTS_QUOTA_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="授信模式" prop="grantMode">
                    <base-select
                      v-model="form.grantMode"
                      disabled
                      placeholder="请选择授信模式"
                      :options="dicts[constant.DICTS_GRANT_MODE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="额度币别" prop="currencyName">
                    <business-autocomplete-basic
                      v-model="form.currencyName"
                      disabled
                      label="额度币别"
                      placeholder="请输入额度币别"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="授信金额" prop="grantMoney">
                    <base-input-number v-model="form.grantMoney" disabled placeholder="请输入授信金额" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="生效日期" prop="effectiveDate">
                    <base-date-picker v-model="form.effectiveDate" disabled type="date" placeholder="选择生效日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="到期日期" prop="expireDate">
                    <base-date-picker v-model="form.expireDate" disabled type="date" placeholder="选择到期日期" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
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
          <el-divider content-position="left">状态</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">生效状态:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.AGREE_STATUS.getFieldByValue(statusForm.agreeStatus, 'color') }">
              {{ enums.AGREE_STATUS.getFieldByValue(statusForm.agreeStatus) }}
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
.cus-quota-record {
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
  .file-content-item {
    display: inline-block;
    font-size: 14px;
    text-decoration: underline;
    color: #409eff;
    cursor: pointer;
  }
  .no-file-content {
    font-size: 12px;
    text-decoration: none;
  }
}
</style>

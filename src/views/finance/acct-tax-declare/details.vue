<script>
import {
  getAcctTaxRefundDeclarationById,
  getAcctTaxRefundDeclarationAuditList,
  auditAcctTaxRefundDeclaration,
  unUpdateBillAcctTaxRefundDeclaration
} from '@/api/finance/acct-tax-refund-declaration'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'
import EnterFormPresent from './components/enter-form-present'
import EnterFormAuditTime from './components/enter-form-audit-time'
import EnterFormTaxAccount from './components/enter-form-tax-account'

export default {
  name: 'Details',
  components: { EnterFormPresent, EnterFormAuditTime, EnterFormTaxAccount },
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
        supplierName: '',
        orderExportYears: '',
        billPerson: '',
        billDate: '',
        billBatch: '',
        taxInvoiceNo: '',
        taxAuditDays: '',
        taxAuditDate: '',
        taxRefundMoney: '',
        taxRefundDate: '',
        remark: ''
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      showBtns: {
        del: false
      },
      statusForm: {
        taxRefundStatus: ''
      },
      dicts: {},
      rightLabelWidth: '70px',
      requestApi: {
        list: () => getAcctTaxRefundDeclarationAuditList(this.tableRow.id),
        save: auditAcctTaxRefundDeclaration
      },
      showAuditDetailsBtn: false,
      dropdownButtonMoresOptions: [],
      present: {
        visible: false,
        row: {}
      },
      taxAccount: {
        visible: false,
        row: {}
      },
      auditTime: {
        visible: false,
        row: {}
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_TAX_DECLARE_AUDIT]
    this.dropdownButtonMoresOptions = [
      {
        label: '??????',
        visible: this.permissions[constant.PERMISSION_TAX_DECLARE_PRESENT],
        handler: this.handlePresent
      },
      {
        label: '????????????',
        visible: this.permissions[constant.PERMISSION_TAX_DECLARE_CANCEL_PRESENT],
        handler: this.handleCancelPresent
      },
      {
        label: '??????????????????',
        visible: this.permissions[constant.PERMISSION_TAX_DECLARE_AUDIT_TIME],
        handler: this.handleAuditTime
      },
      {
        label: '????????????',
        visible: this.permissions[constant.PERMISSION_TAX_DECLARE_TAX_ACCOUNT],
        handler: this.handleTaxAccount
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true

        Promise.all([getDataDictionary([]), getAcctTaxRefundDeclarationById(this.tableRow.id)]).then(([dicts, info]) => {
          const { taxRefundStatus, createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }

          this.statusForm = {
            taxRefundStatus
          }

          Object.assign(this.form, info.data)

          this.showBtns = {
            del: this.permissions[constant.PERMISSION_TAX_DECLARE_DEL]
          }

          if (isFunction(cb)) cb()
          this.loading = false
        })
      })
    },
    handlePresent() {
      if (!(this.form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) {
        return this.$message.error('???????????????????????????')
      }
      if (!(this.form.taxRefundStatus === enums.TAX_REFUND_STATUS.getFieldByKey('UNDELIVERED'))) {
        return this.$message.error('???????????????????????????')
      }
      this.present = {
        visible: true,
        row: this.form
      }
    },
    handleCancelPresent() {
      if (!(this.form.taxRefundStatus === enums.TAX_REFUND_STATUS.getFieldByKey('DELIVERED'))) {
        return this.$message.error('???????????????????????????')
      }
      this.$confirm('???????????????????')
        .then(() => {
          unUpdateBillAcctTaxRefundDeclaration({ id: this.tableRow.id }).then(() => {
            this.handleUpdateInfoReload(() => {
              this.$message.success('????????????')
            })
          })
        })
        .catch(() => {})
    },
    handleAuditTime() {
      if (!(this.form.taxRefundStatus === enums.TAX_REFUND_STATUS.getFieldByKey('DELIVERED'))) {
        return this.$message.error('???????????????????????????')
      }
      this.auditTime = {
        visible: true,
        row: this.form
      }
    },
    handleTaxAccount() {
      if (!(this.form.taxRefundStatus === enums.TAX_REFUND_STATUS.getFieldByKey('REVIEWED'))) {
        return this.$message.error('?????????????????????????????????')
      }
      this.taxAccount = {
        visible: true,
        row: this.form
      }
    },
    handleDelete() {
      this.deleteFn()
    },
    handleAuditSave(closeDialog) {
      this.handleUpdateInfoReload(() => {
        closeDialog()
      })
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
    class="common-operate acct-tax-declare is-details-adaptive"
    element-loading-text="???????????????"
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
          <base-form ref="formRef" :model="form" label-width="90px" size="mini">
            <!-- ???????????? -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="???????????????" prop="supplierName">
                    <base-input v-model="form.supplierName" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="orderExportYears">
                    <base-input v-model="form.orderExportYears" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="billBatch">
                    <base-input v-model="form.billBatch" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="billDate">
                    <base-date-picker
                      v-model="form.billDate"
                      disabled
                      type="month"
                      value-format="yyyy-MM"
                      format="yyyy-MM"
                      placeholder="??????????????????"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="billDate">
                    <base-input v-model="form.billDate" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="billPerson">
                    <base-input v-model="form.billPerson" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="taxInvoiceNo">
                    <base-input v-model="form.taxInvoiceNo" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="taxAuditDays">
                    <base-input v-model="form.taxAuditDays" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????????????????" prop="taxAuditDate">
                    <base-input v-model="form.taxAuditDate" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="taxRefundMoney">
                    <base-input v-model="form.taxRefundMoney" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????????????????" prop="taxRefundDate">
                    <base-input v-model="form.taxRefundDate" disabled />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="????????????" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">??????</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div
              class="dcommon-etails-r-value"
              :style="{ color: enums.TAX_REFUND_STATUS.getFieldByValue(statusForm.taxRefundStatus, 'color') }"
            >
              {{ enums.TAX_REFUND_STATUS.getFieldByValue(statusForm.taxRefundStatus) }}
            </div>
          </div>
        </div>

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
        <business-dropdown-button :options="dropdownButtonMoresOptions">????????????</business-dropdown-button>
        <el-button
          v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-delete"
          type="danger"
          @click="handleDelete"
          >??????</el-button
        >
      </div>
    </div>
    <enter-form-present v-model="present.visible" :table-row="present.row" :re-load="handleUpdateInfoReload" />
    <enter-form-audit-time v-model="auditTime.visible" :table-row="auditTime.row" :re-load="handleUpdateInfoReload" />
    <enter-form-tax-account v-model="taxAccount.visible" :table-row="taxAccount.row" :re-load="handleUpdateInfoReload" />
  </div>
</template>

<style lang="scss" scoped>
.acct-tax-declare {
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

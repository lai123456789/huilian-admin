<script>
import { getAcctReceiptById, getAcctReceiptAuditList, auditAcctReceipt } from '@/api/finance/acct-receipt'
import { getAcctReceiptDetail, deleteAcctReceiptDetailByIds, verifyBatchAcctReceiptDetail } from '@/api/finance/acct-receipt-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import BigNumber from '@/utils/big-number'
import dayjs from '@/utils/day'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import Verification from './components/verification'
import EnterFormLockMoney from './components/enter-form-lock-money'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm, Verification, EnterFormLockMoney },
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
        payCompanyType: enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMER'),
        payCompanyName: '',
        payCompanyId: 0,
        chargeBearType: '',
        receiptUse: '',
        principalName: '',
        principalId: 0,
        principalCompanyId: 0,
        receiptAccount: '',
        receiptBankName: '',
        customerId: 0,
        customerName: '',
        receiptMode: '',
        serialNumber: '',
        receiptRate: 1, // 收款币别为人民币，汇率为1，收款币别为外币，手输
        receiptDate: dayjs().format('YYYY-MM-DD'),
        receiptCurrency: '人民币',
        receiptMoney: 0,
        verifyMoney: 0,
        verifyPayMoney: 0,
        receiptCharge: 0,
        lockMoney: 0,
        remark: ''
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      lockMoney: {
        visible: false,
        row: {}
      },
      statusForm: {
        verifyPayStatus: {
          label: '',
          value: '',
          color: ''
        }
      },
      showBtns: {
        edit: false,
        del: false,
        sdje: false
      },
      verificationForm: {
        visible: false,
        params: {}
      },
      dicts: {},
      rightLabelWidth: '70px',
      showPage: false,
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getAcctReceiptDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ receiptId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getAcctReceiptAuditList(this.tableRow.id),
        save: auditAcctReceipt
      },
      showAuditDetailsBtn: false,
      activeName: '已核销列表'
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    payCompanyModuleName() {
      let moduleName = ''
      switch (this.form.payCompanyType) {
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
        case enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS'):
          moduleName = constant.AUTOCOMPLETE_KEY_FUNDERS
          break
      }
      return moduleName
    }
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_ACCT_RECEIPT_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_PAY_COMPANY_TYPE, DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE, DICTS_RECEIPT_USE } = constant
        Promise.all([
          getDataDictionary([DICTS_PAY_COMPANY_TYPE, DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE, DICTS_RECEIPT_USE]),
          getAcctReceiptById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { verifyPayStatus, receiptUse, createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }
          if (receiptUse === enums.RECEIPT_USE.getFieldByKey('PAYMENT')) {
            this.statusForm = {
              verifyPayStatus: {
                label: '付汇状态',
                value: enums.RECEIPT_PAY_STATUS.getFieldByValue(verifyPayStatus).split('/')[0],
                color: enums.RECEIPT_PAY_STATUS.getFieldByValue(verifyPayStatus, 'color')
              }
            }
          } else if (receiptUse === enums.RECEIPT_USE.getFieldByKey('SOE')) {
            this.statusForm = {
              verifyPayStatus: {
                label: '结汇状态',
                value: enums.RECEIPT_PAY_STATUS.getFieldByValue(verifyPayStatus).split('/')[1],
                color: enums.RECEIPT_PAY_STATUS.getFieldByValue(verifyPayStatus, 'color')
              }
            }
          } else {
            this.statusForm.verifyPayStatus = false
          }

          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_ACCT_RECEIPT_EDIT],
            del: this.permissions[constant.PERMISSION_ACCT_RECEIPT_DEL],
            sdje: this.permissions[constant.PERMISSION_ACCT_RECEIPT_LOCK_MONEY]
          }

          this.columns = this.handleDetailsColumns()[0]
          this.$nextTick(() => {
            if (this.$refs.waitEditTableRef) {
              this.$refs.waitEditTableRef.loadColumns(this.handleDetailsColumns()[1])
            }
          })

          if (isFunction(cb)) cb()
          this.showPage = true
          this.loading = false
        })
      })
    },
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        [
          { field: 'costInvoiceNo', title: '应收编号' },
          {
            field: 'orderType',
            title: '订单类型',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
              }
            }
          },
          { field: 'orderNo', title: '订单编号' },
          {
            field: 'costType',
            title: '费用大类',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COST_TYPE)
              }
            }
          },
          {
            field: 'verifyMoney',
            title: '核销金额',
            formatter: {
              type: 'number'
            }
          },
          { field: 'createByName', title: '创建人名称' },
          { field: 'createTime', title: '创建时间' }
        ],
        [
          { field: 'costNo', width: 150, title: '应收编号' },
          {
            field: 'orderType',
            width: 100,
            title: '订单类型',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
              }
            }
          },
          { field: 'orderNo', width: 150, title: '订单编号' },
          {
            field: 'costType',
            width: 120,
            title: '费用大类',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COST_TYPE)
              }
            }
          },
          { field: 'costName', width: 120, title: '费用名称' },
          { field: 'costDate', width: 130, title: '费用发生日期' },
          { field: 'settleDate', width: 130, title: '应收日期' },
          { field: 'costCurrency', width: 100, title: '应收币别' },
          { field: 'settleMoney', width: 110, title: '应收金额', sum: true },
          { field: 'verifyMoney', width: 110, title: '已收金额', sum: true },
          {
            field: 'verifyArMoney',
            width: 130,
            title: '本次核销金额',
            type: 'inputNumber',
            sum: true,
            attrs: {
              precision: 2
            }
          }
        ]
      ]
    },
    handleTabClick({ name }) {
      if (name === '已核销列表') {
        this.$refs['consumedEditTableRef'].refresh(false)
      } else {
        this.$refs.waitEditTableRef.loadData([], 'cover')
      }
    },
    async againstVerification(rows) {
      await deleteAcctReceiptDetailByIds(rows.map(v => v.id).join(','))
      this.$refs['consumedEditTableRef'].refresh(false)
      this.$message.success('操作成功')
    },
    handleCreate() {
      this.verificationForm = {
        visible: true,
        params: {
          payCompanyType: this.form.payCompanyType,
          payCompanyId: this.form.payCompanyId,
          verifyStatus: [enums.VERIFY_STATUS.getFieldByKey('UN_VERIFY'), enums.VERIFY_STATUS.getFieldByKey('PART_VERIFY')].join(','),
          settleCurrency: this.form.receiptCurrency,
          principalId: this.form.principalId
        }
      }
    },
    async handleVerificationSave(data, done) {
      const tableData = this.$refs.waitEditTableRef.getRecords()
      data.forEach(v => {
        v.verifyArMoney = new BigNumber(Number(v.settleMoney)).minus(Number(v.verifyMoney)).toNumber()
      })
      if (!tableData.length) {
        await this.$refs.waitEditTableRef.loadData(data, 'cover')
      } else if (tableData.length > 0) {
        if (data.length > 0) {
          const results = []
          data.forEach(v => {
            const target = tableData.find(x => x.id === v.id)
            target ? results.push(target) : results.push(v)
          })
          this.$refs.waitEditTableRef.loadData(results, 'cover')
        } else {
          this.$refs.waitEditTableRef.loadData([], 'cover')
        }
      }
      done()
      this.verificationForm.visible = false
    },
    async handleConfirm() {
      const tableData = this.$refs.waitEditTableRef.getRecords()
      const acctReceiptDetailVerifyDTOList = tableData.map(v => ({
        costInvoiceId: v.id,
        verifyMoney: v.verifyArMoney || 0
      }))

      await verifyBatchAcctReceiptDetail({ receiptId: this.tableRow.id, acctReceiptDetailVerifyDTOList })

      this.$refs.waitEditTableRef.loadData([], 'cover')
      this.$message.success('操作成功')
    },
    handleLockMoney() {
      this.lockMoney = {
        visible: true,
        row: {
          receiptId: this.tableRow.id,
          lockMoney: this.form.lockMoney
        }
      }
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
    class="common-operate receipt is-details-adaptive"
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
                  <base-form-item label="付款方类型" prop="payCompanyType">
                    <base-select
                      v-model="form.payCompanyType"
                      placeholder="请选择付款方类型"
                      disabled
                      :clearable="false"
                      :options="dicts[constant.DICTS_PAY_COMPANY_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="付款方" prop="payCompanyName">
                    <business-autocomplete-basic
                      v-model="form.payCompanyName"
                      label="付款方"
                      placeholder="请输入付款方"
                      disabled
                      :module-name="payCompanyModuleName"
                      :auto-assign="{
                        payCompanyId: 'companyId'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="委托客户" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      label="委托客户"
                      placeholder="请输入委托客户"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                      :auto-assign="{
                        customerId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="款项用途" prop="receiptUse">
                    <base-select
                      v-model="form.receiptUse"
                      placeholder="请选择款项用途"
                      disabled
                      :clearable="false"
                      :options="dicts[constant.DICTS_RECEIPT_USE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款方式" prop="receiptMode">
                    <base-select
                      v-model="form.receiptMode"
                      disabled
                      placeholder="请选择收款方式"
                      :clearable="false"
                      :options="dicts[constant.DICTS_RECEIPT_MODE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款主体" prop="principalName">
                    <business-autocomplete-basic
                      v-model="form.principalName"
                      label="收款主体"
                      placeholder="请输入收款主体"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                      :auto-assign="{
                        principalId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款银行名称" prop="receiptBankName">
                    <business-autocomplete-bank
                      v-model="form.receiptBankName"
                      value-key="bankName"
                      label="收款银行名称"
                      disabled
                      placeholder="请输入收款银行名称"
                      :params="{
                        companyId: form.principalCompanyId
                      }"
                    ></business-autocomplete-bank>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款银行账号" prop="receiptAccount">
                    <base-input v-model="form.receiptAccount" disabled placeholder="请输入收款银行账号"></base-input>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="银行流水号" prop="serialNumber">
                    <base-input v-model="form.serialNumber" disabled placeholder="请输入银行流水号"></base-input>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款日期" prop="receiptDate">
                    <base-date-picker v-model="form.receiptDate" disabled type="date" placeholder="选择收款日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款币别" prop="receiptCurrency">
                    <business-autocomplete-basic
                      v-model="form.receiptCurrency"
                      label="收款币别"
                      placeholder="请输入收款币别"
                      disabled
                      :before-input="
                        () => {
                          form.receiptRate = 0
                        }
                      "
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款金额" prop="receiptMoney">
                    <base-input-number v-model="form.receiptMoney" disabled placeholder="请输入收款金额" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="锁定金额" prop="lockMoney">
                    <base-input-number v-model="form.lockMoney" disabled placeholder="请输入锁定金额" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="手续费" prop="receiptCharge">
                    <base-input-number v-model="form.receiptCharge" disabled placeholder="请输入手续费" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="手续费承担方式" prop="chargeBearType">
                    <base-select
                      v-model="form.chargeBearType"
                      disabled
                      placeholder="请选择手续费承担方式"
                      :options="dicts[constant.DICTS_CHARGE_BEAR_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.receiptCurrency && form.receiptCurrency !== '人民币'" :span="6">
                  <base-form-item label="收款汇率" prop="receiptRate">
                    <base-input-number v-model="form.receiptRate" :precision="6" disabled placeholder="请输入收款汇率" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="核销金额" prop="verifyMoney">
                    <base-input v-model="form.verifyMoney" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="已付汇金额/已结汇金额" prop="verifyPayMoney">
                    <base-input v-model="form.verifyPayMoney" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="请输入备注" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <div v-if="form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')" class="common-operate-block">
              <el-tabs v-model="activeName" type="card" class="common-compact-tabs" @tab-click="handleTabClick">
                <el-tab-pane label="已核销列表" name="已核销列表">
                  <base-page
                    v-if="showPage"
                    ref="consumedEditTableRef"
                    :request="request"
                    :columns="columns"
                    :tools-config="{
                      setting: {
                        visible: false
                      },
                      download: {
                        visible: false
                      }
                    }"
                    :buttons-config="{
                      mores: [
                        {
                          label: '反核销',
                          visible: true,
                          multiple: true,
                          handler: rows => againstVerification(rows)
                        }
                      ]
                    }"
                    show-footer
                    :name="constant.TABLE_NAME_ACCT_RECEIPT_CONSUMED"
                  />
                </el-tab-pane>
                <el-tab-pane label="待核销列表" name="待核销列表">
                  <base-edit-table ref="waitEditTableRef" :show-added="false" show-footer :name="constant.TABLE_NAME_ACCT_RECEIPT_WAIT">
                    <template v-slot:buttons="{ selectRecords }">
                      <el-button size="mini" type="primary" :disabled="false" @click="handleCreate(selectRecords)">生成</el-button>
                      <el-button size="mini" type="primary" :disabled="!selectRecords.length" @click="handleConfirm(selectRecords)"
                        >确认</el-button
                      >
                    </template>
                  </base-edit-table>
                </el-tab-pane>
              </el-tabs>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div v-if="statusForm.verifyPayStatus" class="common-operate-r-block">
          <el-divider content-position="left">状态</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">{{ statusForm.verifyPayStatus.label }}:</div>
            <div class="dcommon-etails-r-value" :style="{ color: statusForm.verifyPayStatus.color }">
              {{ statusForm.verifyPayStatus.value }}
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
        <el-button v-if="showBtns.sdje" icon="el-icon-s-operation" type="primary" @click="handleLockMoney">锁定金额</el-button>
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
    <enter-form-lock-money v-model="lockMoney.visible" :table-row="lockMoney.row" :re-load="handleUpdateInfoReload"></enter-form-lock-money>
    <verification
      v-model="verificationForm.visible"
      :params="verificationForm.params"
      :parent-details-table-instance="() => this.$refs.waitEditTableRef"
      @save="handleVerificationSave"
    />
  </div>
</template>

<style lang="scss" scoped>
.receipt {
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
    &:last-child {
      min-height: 400px;
    }
  }
  .common-compact-tabs {
    ::v-deep .base-page-toolbar {
      padding-top: 0;
    }
    ::v-deep .base-page-footer {
      padding-bottom: 0;
    }
  }
}
</style>

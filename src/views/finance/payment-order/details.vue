<script>
import { getAcctPaymentById, getAcctPaymentAuditList, auditAcctPayment, unConfimAcctPayment } from '@/api/finance/acct-payment'
import { getAcctPaymentDetail, deleteAcctPaymentDetailByIds, verifyBatchAcctPaymentDetail } from '@/api/finance/acct-payment-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import BigNumber from '@/utils/big-number'
import dayjs from '@/utils/day'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import Verification from './components/verification'
import EnterFormConfirm from './components/enter-form-confirm'
import { mapGetters } from 'vuex'

export default {
  name: 'Details',
  components: { EnterForm, Verification, EnterFormConfirm },
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
        receiptCompanyType: enums.PAY_COMPANY_TYPE.getFieldByKey('SUPPLIER'),
        receiptCompanyName: '',
        receiptCompanyId: 0,
        customerId: 0,
        customerName: '',
        beforeFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
        payMode: '',
        principalName: '',
        principalCompanyId: 0,
        payBankName: '',
        payBankId: 0,
        payAccount: '',
        receiptSwiftCode: '',
        serialNumber: '',
        payRate: 0,
        payCharge: 0,
        applyPayDate: dayjs().format('YYYY-MM-DD'),
        payCurrency: '人民币',
        payMoney: 0,
        verifyMoney: 0,
        receiptBankName: '',
        receiptAccount: '',
        chargeBearType: '',
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
      statusForm: {
        payStatus: ''
      },
      enterFormConfirm: {
        visible: false,
        row: {}
      },
      showBtns: {
        edit: false,
        del: false
      },
      verificationForm: {
        visible: false,
        params: {}
      },
      dicts: {},
      rightLabelWidth: '70px',
      showPage: false,
      columns: [],
      request: null,
      requestApi: {
        list: () => getAcctPaymentAuditList(this.tableRow.id),
        save: auditAcctPayment
      },
      showAuditDetailsBtn: false,
      activeName: '已核销列表',
      dropdownButtonMoresOptions: []
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    receiptCompanyModuleName() {
      let moduleName = ''
      switch (this.form.receiptCompanyType) {
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
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_PAY_ORDER_AUDIT]
    this.dropdownButtonMoresOptions = [
      {
        label: '确认付款',
        visible: this.permissions[constant.PERMISSION_PAY_ORDER_CONFIM],
        handler: this.handleConfirmPayment
      },
      {
        label: '取消付款',
        visible: this.permissions[constant.PERMISSION_PAY_ORDER_UN_CONFIM],
        handler: this.handleUnPayment
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_PAY_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE, DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_PAY_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE, DICTS_WHETHER_STATUS]),
          getAcctPaymentById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { auditStatus, payStatus, createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }
          this.statusForm = {
            payStatus
          }
          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_PAY_ORDER_EDIT],
            del: this.permissions[constant.PERMISSION_PAY_ORDER_DEL]
          }

          // 不是已审核数据只展示明细数据
          if (auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')) {
            this.$nextTick(() => {
              this.columns = this.handleColumns()[0]
              this.request = async ({ pager, params }) => {
                const { data } = await getAcctPaymentDetail({
                  ...pager,
                  ...transforArrayPayload(Object.assign({ payId: this.tableRow.id }, params))
                })
                return {
                  data: data.records,
                  total: data.total
                }
              }
              if (cb) cb()
              this.showPage = true
              this.loading = false
            })
          } else {
            this.$nextTick(() => {
              this.columns = this.handleColumns()[1]
              this.$refs.waitEditTableRef.loadColumns(this.handleColumns()[2])
              this.request = async ({ pager, params }) => {
                const { data } = await getAcctPaymentDetail({
                  ...pager,
                  ...transforArrayPayload(Object.assign({ payId: this.tableRow.id }, params))
                })
                return {
                  data: data.records,
                  total: data.total
                }
              }
              if (cb) cb()
              this.showPage = true
              this.loading = false
            })
          }
        })
      })
    },
    /** 明细列数据 */
    handleColumns() {
      return [
        // 付款单明细
        [
          { field: 'costPayNo', title: '应付编号' },
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
          { field: 'costName', title: '费用名称' },
          {
            field: 'verifyMoney',
            title: '核销金额',
            type: 'inputNumber',
            align: 'right',
            sum: true,
            attrs: {
              precision: 2
            },
            on: {
              blur: () => this.handleDeleteSelectRecords()
            }
          },
          { field: 'createByName', title: '创建人名称' },
          { field: 'createTime', title: '创建时间' }
        ],
        // 已核销
        [
          { field: 'costPayNo', title: '应付编号' },
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
          { field: 'costName', title: '费用名称' },
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
        // 待核销
        [
          { field: 'costNo', title: '应付编号', width: 150 },
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
          { field: 'orderNo', title: '订单编号', width: 150 },
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
          { field: 'costName', title: '费用名称', width: 130 },
          { field: 'settleCurrency', title: '应付币别', width: 100 },
          {
            field: 'settleMoney',
            width: 110,
            title: '应付金额',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'verifyMoney',
            width: 110,
            title: '已付金额',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'verifyApMoney',
            width: 130,
            title: '本次核销金额',
            type: 'inputNumber',
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
      if (this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')) return this.$message.error('非预付款的付款单不能反核销')
      await deleteAcctPaymentDetailByIds(rows.map(v => v.id).join(','))
      this.$refs['consumedEditTableRef'].refresh(false)
      this.$message.success('操作成功')
    },
    handleCreate() {
      if (this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')) return this.$message.warning('非预付款的付款单不能核销')
      this.verificationForm = {
        visible: true,
        params: {
          receiptCompanyType: this.form.receiptCompanyType,
          receiptCompanyId: this.form.receiptCompanyId,
          customerId: this.form.customerId === 0 ? void 0 : this.form.customerId,
          verifyStatus: [enums.VERIFY_STATUS.getFieldByKey('UN_VERIFY'), enums.VERIFY_STATUS.getFieldByKey('PART_VERIFY')].join(','),
          settleCurrency: this.form.payCurrency
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
      if (this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')) return this.$message.warning('非预付款的付款单不能核销')
      const tableData = this.$refs.waitEditTableRef.getRecords()
      const acctPaymentDetailVerifyDTOList = tableData.map(v => ({
        costPayId: v.id,
        verifyMoney: v.verifyApMoney || 0
      }))
      await verifyBatchAcctPaymentDetail({ receiptId: this.mainRow.id, acctPaymentDetailVerifyDTOList })
      this.$refs.waitEditTableRef.loadData([], 'cover')
      this.$message.success('操作成功')
    },
    handleConfirmPayment() {
      this.enterFormConfirm = {
        visible: true,
        row: this.tableRow
      }
    },
    handleUnPayment() {
      unConfimAcctPayment(this.tableRow.id).then(() => {
        this.handleUpdateInfoReload()
        this.$message.success('操作成功')
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
          <base-form ref="formRef" :model="form" label-width="110px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="付款主体" prop="principalName">
                    <base-input v-model="form.principalName" disabled></base-input>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款方类型" prop="receiptCompanyType">
                    <base-select
                      v-model="form.receiptCompanyType"
                      placeholder="请选择收款方类型"
                      disabled
                      :clearable="false"
                      :options="dicts[constant.DICTS_PAY_COMPANY_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款方" prop="receiptCompanyName">
                    <business-autocomplete-basic
                      v-model="form.receiptCompanyName"
                      label="收款方"
                      disabled
                      placeholder="请输入付款方收款方"
                      :module-name="receiptCompanyModuleName"
                      :auto-assign="{
                        receiptCompanyId: 'companyId'
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
                      disabled
                      label="收款银行名称"
                      placeholder="请输入收款银行名称"
                      :params="{
                        companyId: form.receiptCompanyId
                      }"
                      :auto-assign="{
                        receiptBankName: 'bankName',
                        receiptAccount: 'accountCode'
                      }"
                      :form="form"
                    ></business-autocomplete-bank>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款银行账号" prop="receiptAccount">
                    <base-input v-model="form.receiptAccount" disabled placeholder="请输入收款银行账号"></base-input>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款银行SWIFT" prop="receiptSwiftCode">
                    <base-input v-model="form.receiptSwiftCode" disabled placeholder="请输入收款银行SWIFT"></base-input>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="委托客户" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      disabled
                      label="委托客户"
                      placeholder="请输入委托客户"
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                      :auto-assign="{
                        customerId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="是否预付款" prop="beforeFlag">
                    <base-select
                      v-model="form.beforeFlag"
                      disabled
                      placeholder="请选择是否预付款"
                      :clearable="false"
                      :options="dicts[constant.DICTS_WHETHER_STATUS]"
                    />
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

                <base-col :span="6">
                  <base-form-item label="付款方式" prop="payMode">
                    <base-select
                      v-model="form.payMode"
                      disabled
                      placeholder="请选择付款方式"
                      :clearable="false"
                      :options="dicts[constant.DICTS_RECEIPT_MODE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="申请付款日期" prop="applyPayDate">
                    <base-date-picker v-model="form.applyPayDate" disabled type="date" placeholder="选择申请付款日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="付款币别" prop="payCurrency">
                    <business-autocomplete-basic
                      v-model="form.payCurrency"
                      disabled
                      label="付款币别"
                      placeholder="请输入付款币别"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="付款金额" prop="payMoney">
                    <base-input-number v-model="form.payMoney" disabled placeholder="请输入付款金额" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="付款汇率" prop="payRate">
                    <base-input-number v-model="form.payRate" disabled :precision="6" placeholder="请输入付款汇率" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="手续费" prop="payCharge">
                    <base-input-number v-model="form.payCharge" disabled placeholder="请输入手续费" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="核销金额" prop="verifyMoney">
                    <base-input v-model="form.verifyMoney" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="付款银行名称" prop="payBankName">
                    <base-input v-model="form.payBankName" disabled></base-input>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="付款银行账号" prop="payAccount">
                    <base-input v-model="form.payAccount" disabled></base-input>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="银行流水号" prop="serialNumber">
                    <base-input v-model="form.serialNumber" disabled placeholder="请输入银行流水号"></base-input>
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
                    :name="constant.TABLE_NAME_PAY_ORDER_CONSUMED"
                  />
                </el-tab-pane>
                <el-tab-pane label="待核销列表" name="待核销列表">
                  <base-edit-table ref="waitEditTableRef" :show-added="false" :name="constant.TABLE_NAME_PAY_ORDER_WAIT">
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
            <!--付款单明细 -->
            <div v-else class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                付款单明细
              </span>
              <div class="common-operate-block-body">
                <base-page
                  v-if="showPage"
                  ref="tableDetailsRef"
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
                  show-footer
                  :name="constant.TABLE_NAME_PAY_ORDER_DETAILS"
                />
              </div>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">状态</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">付款状态:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.PAY_STATUS.getFieldByValue(statusForm.payStatus, 'color') }">
              {{ enums.PAY_STATUS.getFieldByValue(statusForm.payStatus) }}
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
        <business-dropdown-button :options="dropdownButtonMoresOptions">更多操作</business-dropdown-button>
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
    <enter-form-confirm v-model="enterFormConfirm.visible" :table-row="enterFormConfirm.row"></enter-form-confirm>
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

<script>
import { importPaymentAcctReceipt } from '@/api/finance/acct-receipt'
import { getDataDictionary } from '@/api/admin/dicts'
import ForNoPay from './for-no-pay'
import { validatorNumRequired } from '@/utils/validate'
import { clone } from 'xe-utils'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  receiptMoney: 0,
  enableReceiptMoney: 0,
  theReceiptMoney: 0,
  payCurrency: '',
  receiptSwiftCode: '',
  payMoney: 0,
  receiptAccount: '',
  receiptBankName: '',
  settleRate: 0,
  supplierName: '',
  receiptCompanyId: 0,
  supplierId: 0,
  customerName: '',
  customerId: 0,
  payMode: '',
  chargeBearType: '',
  applyPayDate: dayjs().format('YYYY-MM-DD'),
  beforeFlag: enums.WHETHER_STATUS.getFieldByKey('NO')
}

export default {
  name: 'EnterFormClaimPay',
  components: { ForNoPay },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    tableRows: Array,
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
        supplierName: [{ required: true, message: '收款供应商必填' }],
        receiptBankName: [{ required: true, message: '收款银行名称必填' }],
        receiptAccount: [{ required: true, message: '收款银行账号必填' }],
        receiptSwiftCode: [{ required: true, message: '国际银联号必填' }],
        payMode: [{ required: true, message: '付款方式必填' }],
        chargeBearType: [{ required: true, message: '手续费承担方式必填' }],
        applyPayDate: [{ required: true, message: '申请付款日期必填' }],
        payCurrency: [{ required: true, message: '申请付款日期必填' }],
        settleRate: [{ required: true, message: '委托付汇汇率必填', validator: validatorNumRequired }],
        payMoney: [
          {
            required: true,
            message: '本次付汇金额必填',
            validator: validatorNumRequired
          }
        ],
        theReceiptMoney: [
          {
            validator: (rule, value, callback) => {
              if (value > this.form.enableReceiptMoney) {
                callback('本次使用收款金额不能大于可使用收款金额')
              } else {
                callback()
              }
            }
          }
        ]
      },
      dicts: {},
      forNotPay: {
        visible: false,
        params: {}
      }
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
    },
    // ----------- 固定定义 -----------
    'form.payMoney': {
      handler() {
        this.calcTheReceiptMoney()
      },
      immediate: true
    },
    'form.settleRate': {
      handler() {
        this.calcTheReceiptMoney()
      },
      immediate: true
    }
  },
  methods: {
    getFormData() {
      this.$nextTick(() => {
        this.form = clone(form, true)
        this.getFormInstance().resetFields()
        const { DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE } = constant
        Promise.all([getDataDictionary([DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE])]).then(([dicts]) => {
          this.dicts = dicts
          let settleMoneySum = 0
          let lockMoneySum = 0
          let verifyMoneySum = 0
          let verifyPayMoneySum = 0
          let receiptMoneySum = 0
          this.tableRows.forEach(row => {
            settleMoneySum = new BigNumber(settleMoneySum).plus(row.settleMoney).toNumber()
            lockMoneySum = new BigNumber(lockMoneySum).plus(row.lockMoney).toNumber()
            receiptMoneySum = new BigNumber(receiptMoneySum).plus(row.receiptMoney).toNumber()
            verifyMoneySum = new BigNumber(verifyMoneySum).plus(row.verifyMoney).toNumber()
            verifyPayMoneySum = new BigNumber(verifyPayMoneySum).plus(row.verifyPayMoney).toNumber()
          })
          this.form.receiptMoney = receiptMoneySum
          this.form.enableReceiptMoney = new BigNumber(receiptMoneySum).minus(verifyMoneySum).minus(verifyPayMoneySum).toNumber()

          if (this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')) {
            this.$nextTick(() => {
              this.getDetailsEditTableInstance().loadColumns(this.handleDetailsColumns())
              this.getDetailsEditTableInstance().loadData([], 'cover')
            })
          }
        })
      })
    },
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        { field: 'orderNo', width: 160, title: '订单编号' },
        { field: 'cusOrderNo', width: 160, title: '客户订单号' },
        { field: 'orderDate', width: 120, title: '订单日期' },
        { field: 'customerName', width: 180, title: '客户名称' },
        { field: 'supplierName', width: 180, title: '供应商名称' },
        {
          field: 'totalMoney',
          width: 100,
          title: '订单金额',
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'payApplyMoney',
          width: 120,
          title: '已付汇金额',
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'payMoney',
          title: '本次付汇金额',
          width: 180,
          type: 'inputNumber',
          rules: [{ required: true, message: '本次付汇金额必填' }],
          attrs: {
            precision: 2
          },
          on: {
            blur: this.calcPayMoneyTotal
          }
        }
      ]
    },
    handleSupplierNameBeforeInput() {
      Object.assign(this.form, {
        supplierId: 0,
        companyId: 0
      })
      this.clearTableData()
    },
    handleSupplierNameSelect(rows) {
      const { id, companyId } = rows[0]
      Object.assign(this.form, {
        supplierId: id,
        receiptCompanyId: companyId
      })
      this.clearTableData()
    },
    handleSupplierNameClear() {
      this.clearTableData()
    },
    handleCustomerNameSelect(rows) {
      const { id } = rows[0]
      Object.assign(this.form, {
        customerId: id
      })
      this.clearTableData()
    },
    handleCustomerNameClear() {
      this.clearTableData()
    },
    handleReceiptBankNameAddBeforeClick() {
      if (this.form.supplierId === 0) {
        this.$message.warning('请先选择已存在的收款供应商')
        return false
      }
      return true
    },
    handleCustomerNameBeforeInput() {
      Object.assign(this.form, {
        customerId: 0
      })
      this.clearTableData()
    },
    handleBeforeFlagChange(value) {
      if (value === enums.WHETHER_STATUS.getFieldByKey('NO')) {
        this.$nextTick(() => {
          this.getDetailsEditTableInstance().loadColumns(this.handleDetailsColumns())
          this.getDetailsEditTableInstance().loadData([], 'cover')
        })
      }
    },
    handleCreate() {
      if (this.form.customerName === '' || !this.form.customerId) return this.$message.error('请填写委托客户')
      if (this.form.supplierName === '' || !this.form.supplierId) return this.$message.error('请填写收款供应商')
      if (this.form.payCurrency === '') return this.$message.error('请填写付汇币别')

      this.forNotPay = {
        visible: true,
        params: {
          customerId: this.form.customerId,
          supplierId: this.form.supplierId,
          payCurrency: this.form.payCurrency
        }
      }
    },
    async handleForNotPaySave(data, done) {
      data.forEach(v => {
        v.payMoney = new BigNumber(Number(v.totalMoney)).minus(Number(v.payApplyMoney)).dp(2).toNumber()
      })
      const tableData = this.getDetailsEditTableInstance().getRecords()
      if (!tableData.length) {
        await this.getDetailsEditTableInstance().loadData(data, 'cover')
      } else if (tableData.length > 0) {
        if (data.length > 0) {
          const results = []
          data.forEach(v => {
            const target = tableData.find(x => x.id === v.id)
            target ? results.push(target) : results.push(v)
          })
          await this.getDetailsEditTableInstance().loadData(results, 'cover')
        } else {
          await this.getDetailsEditTableInstance().loadData([], 'cover')
        }
      }
      done()
      this.calcPayMoneyTotal()
      this.forNotPay.visible = false
    },
    clearTableData() {
      this.$nextTick(() => {
        if (this.getDetailsEditTableInstance()) {
          this.getDetailsEditTableInstance().loadData([], 'cover')
        }
      })
    },
    calcPayMoneyTotal() {
      const records = this.getDetailsEditTableInstance().getRecords()
      this.form.payMoney = records.reduce((total, row) => new BigNumber(total).plus(row.payMoney).dp(2).toNumber(), 0)
    },
    // 计算本次使用收款金额
    calcTheReceiptMoney() {
      this.form.theReceiptMoney = new BigNumber(this.form.payMoney).times(this.form.settleRate).dp(2).toNumber()
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const ids = this.tableRows.map(v => v.id)
          if (this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')) {
            this.getDetailsEditTableInstance().validate(valids => {
              if (valids) {
                const { rowIndex, rule } = valids
                return this.$message.error(`付汇记录: 第${rowIndex + 1}行 ${rule.message}`)
              }
              const acctPaymentOrderImportDTOList = this.getDetailsEditTableInstance().getRecords()
              importPaymentAcctReceipt(
                Object.assign(
                  { ids, acctPaymentOrderImportDTOList: acctPaymentOrderImportDTOList.map(v => ({ orderId: v.id, payMoney: v.payMoney })) },
                  this.form
                )
              )
                .then(() => {
                  this.$message.success('操作成功')
                  this.visible = false
                  done()
                  this.reLoad(false)
                })
                .catch(() => {
                  done()
                })
            })
          } else {
            importPaymentAcctReceipt(Object.assign({ ids }, this.form))
              .then(() => {
                this.$message.success('操作成功')
                this.visible = false
                done()
                this.reLoad(false)
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
    width="98%"
    custom-class="common-form-dialog enter-form-claim-pay-dialog"
    title="认领付汇"
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="123px" size="mini">
      <!-- 收款方信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          收款方信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="收款供应商" prop="supplierName">
              <business-autocomplete-basic
                v-model="form.supplierName"
                label="收款供应商"
                placeholder="请输入收款供应商"
                :module-name="constant.AUTOCOMPLETE_KEY_SUPPLIER"
                :before-input="handleSupplierNameBeforeInput"
                @select="handleSupplierNameSelect"
                @clear="handleSupplierNameClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收款银行名称" prop="receiptBankName">
              <business-autocomplete-bank
                v-model="form.receiptBankName"
                value-key="bankName"
                label="收款银行名称"
                placeholder="请输入收款银行名称"
                :params="{
                  companyId: form.receiptCompanyId
                }"
                :add-before-click="handleReceiptBankNameAddBeforeClick"
                :auto-assign="{
                  receiptAccount: 'accountCode',
                  receiptSwiftCode: 'swiftCode'
                }"
                :form="form"
              ></business-autocomplete-bank>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收款银行账号" prop="receiptAccount">
              <base-input v-model="form.receiptAccount" placeholder="请输入收款银行账号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="国际银联号" prop="receiptSwiftCode">
              <base-input v-model="form.receiptSwiftCode" placeholder="请输入国际银联号" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 委托方信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          委托方信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="委托客户" prop="customerName">
              <business-autocomplete-basic
                v-model="form.customerName"
                label="委托客户"
                placeholder="请输入委托客户"
                :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                :before-input="handleCustomerNameBeforeInput"
                @select="handleCustomerNameSelect"
                @clear="handleCustomerNameClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="付款方式" prop="payMode">
              <base-select
                v-model="form.payMode"
                placeholder="请选择付款方式"
                :clearable="false"
                :options="dicts[constant.DICTS_RECEIPT_MODE]"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="手续费承担方式" prop="chargeBearType">
              <base-select
                v-model="form.chargeBearType"
                placeholder="请选择手续费承担方式"
                :options="dicts[constant.DICTS_CHARGE_BEAR_TYPE]"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="申请付款日期" prop="applyPayDate">
              <base-date-picker v-model="form.applyPayDate" placeholder="选择申请付款日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收款单金额" prop="receiptMoney">
              <base-input-number v-model="form.receiptMoney" disabled placeholder="请输入收款单金额" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="可使用收款金额" prop="enableReceiptMoney">
              <base-input-number v-model="form.enableReceiptMoney" disabled placeholder="请输入可使用收款金额" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="付汇币别" prop="payCurrency">
              <business-autocomplete-basic
                v-model="form.payCurrency"
                label="订单付汇币别"
                placeholder="请输入付汇币别"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="委托付汇汇率" prop="settleRate">
              <base-input-number v-model="form.settleRate" :decimal="6" placeholder="请输入委托付汇汇率" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="本次付汇金额" prop="payMoney">
              <base-input-number
                v-model="form.payMoney"
                :disabled="form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')"
                placeholder="请输入本次付汇金额"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="本次使用收款金额" prop="theReceiptMoney">
              <base-input-number v-model="form.theReceiptMoney" disabled placeholder="请输入本次使用收款金额" />
            </base-form-item>
          </base-col>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="是否预付汇" prop="beforeFlag">
              <base-switch
                v-model="form.beforeFlag"
                :active-value="enums.WHETHER_STATUS.getFieldByKey('YES')"
                :inactive-value="enums.WHETHER_STATUS.getFieldByKey('NO')"
                @change="handleBeforeFlagChange"
              />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 付汇记录 -->
      <div v-if="form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')" class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          付汇记录
        </span>
        <base-edit-table
          ref="detailsEditTableRef"
          height="300px"
          :show-added="false"
          :name="constant.TABLE_NAME_ACCT_RECEIPT_PAYMENT"
          @delete="calcPayMoneyTotal"
        >
          <template v-slot:buttons="{ selectRecords }">
            <el-button size="mini" type="primary" @click="handleCreate(selectRecords)">查询未付汇的订单</el-button>
          </template>
        </base-edit-table>
      </div>
    </base-form>

    <for-no-pay
      v-model="forNotPay.visible"
      :params="forNotPay.params"
      :parent-details-table-instance="getDetailsEditTableInstance"
      @save="handleForNotPaySave"
    ></for-no-pay>
  </base-dialog>
</template>

<style lang="scss">
.enter-form-claim-pay-dialog {
  .common-form-block {
    &.is-special {
      box-sizing: border-box;
      padding-bottom: 10px;
      .common-form-block-header {
        margin-bottom: 10px;
      }
    }
  }
}
</style>

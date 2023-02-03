<script>
import { exportSettlementAcctReceipt } from '@/api/finance/acct-receipt'
import { getDataDictionary } from '@/api/admin/dicts'
import ForNoSettle from './for-no-settle'
import { clone } from 'xe-utils'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  principalName: '',
  principalId: 0,
  principalCompanyId: 0,
  payMoney: 0,
  totalMoney: 0,
  receiptAccount: '',
  receiptBankName: '',
  supplierName: '',
  receiptCompanyId: 0,
  supplierId: 0,
  beforeFlag: enums.WHETHER_STATUS.getFieldByKey('NO')
}

export default {
  name: 'EnterFormClaimSettle',
  components: { ForNoSettle },
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
        principalName: [{ required: true, message: '付款主体必填' }],
        supplierName: [{ required: true, message: '收款供应商必填' }],
        receiptBankName: [{ required: true, message: '收款银行名称必填' }],
        receiptAccount: [{ required: true, message: '收款银行账号必填' }]
      },
      dicts: {},
      forNotSettle: {
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
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    getFormData() {
      this.$nextTick(() => {
        this.form = clone(form, true)
        this.getFormInstance().resetFields()
        const { DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE } = constant
        Promise.all([getDataDictionary([DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE])]).then(([dicts]) => {
          this.dicts = dicts
          this.$nextTick(() => {
            if (this.getEditTableAInstance()) {
              this.getEditTableAInstance().loadColumns(this.handleDetailsColumns()[0])
              this.getEditTableAInstance().loadData(
                this.tableRows.map(row => {
                  const n1 = new BigNumber(row.lockMoney).plus(row.verifyPayMoney).dp(2).toNumber()
                  const payMoney = new BigNumber(row.settleMoney).minus(n1).dp(2).toNumber()
                  return {
                    ...row,
                    payMoney,
                    payCurrency: '人民币',
                    totalMoney: new BigNumber(payMoney).times(row.receiptRate).dp(2).toNumber()
                  }
                })
              )
            }
            if (this.getEditTableBInstance()) {
              this.getEditTableBInstance().loadColumns(this.handleDetailsColumns()[1])
            }
          })
        })
      })
    },
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        [
          { field: 'receiptNo', width: 160, title: '收款单号' },
          {
            field: 'receiptMoney',
            width: 120,
            title: '收款金额',
            formatter: {
              type: 'number'
            }
          },
          { field: 'receiptCurrency', width: 100, title: '收款币别' },
          {
            field: 'lockMoney',
            width: 120,
            title: '锁定金额',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'verifyPayMoney',
            width: 120,
            title: '已结汇金额',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'receiptCharge',
            width: 120,
            title: '手续费',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'payMoney',
            title: '本次结汇金额',
            width: 180,
            type: 'inputNumber',
            rules: [{ required: true, message: '本次结汇金额必填' }],
            attrs: {
              precision: 2
            },
            on: {
              blur: (v, column, scope) => this.calcTotalMoney(v, column, scope)
            }
          },
          { field: 'receiptRate', width: 100, title: '结汇汇率' },
          { field: 'payCurrency', width: 100, title: '付款币别' },
          {
            field: 'totalMoney',
            width: 120,
            title: '付款金额',
            formatter: {
              type: 'number'
            }
          }
        ],
        [
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
            title: '已结汇金额',
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'payMoney',
            title: '本次结汇金额',
            width: 180,
            type: 'inputNumber',
            rules: [{ required: true, message: '本次结汇金额必填' }],
            attrs: {
              precision: 2
            }
          }
        ]
      ]
    },
    handleSupplierNameBeforeInput() {
      Object.assign(this.form, {
        supplierId: 0,
        companyId: 0
      })
      this.clearTableDataB()
    },
    handleSupplierNameSelect(rows) {
      const { id, companyId } = rows[0]
      Object.assign(this.form, {
        supplierId: id,
        receiptCompanyId: companyId
      })
      this.clearTableDataB()
    },
    handleSupplierNameClear() {
      this.clearTableDataB()
    },
    handleReceiptBankNameAddBeforeClick() {
      if (this.form.supplierId === 0) {
        this.$message.warning('请先选择已存在的收款供应商')
        return false
      }
      return true
    },
    handleBeforeFlagChange(value) {
      if (value === enums.WHETHER_STATUS.getFieldByKey('NO')) {
        this.$nextTick(() => {
          this.getEditTableBInstance().loadColumns(this.handleDetailsColumns()[1])
          this.getEditTableBInstance().loadData([], 'cover')
        })
      }
    },
    handleCreate() {
      if (this.form.supplierName === '' || !this.form.supplierId) return this.$message.error('请填写收款供应商')
      this.forNotSettle = {
        visible: true,
        params: {
          supplierId: this.form.supplierId
        }
      }
    },
    async handleForNotSettleSave(data, done) {
      data.forEach(v => {
        v.payMoney = new BigNumber(Number(v.totalMoney)).minus(Number(v.payApplyMoney)).dp(2).toNumber()
      })
      const tableData = this.getEditTableBInstance().getRecords()
      if (!tableData.length) {
        await this.getEditTableBInstance().loadData(data, 'cover')
      } else if (tableData.length > 0) {
        if (data.length > 0) {
          const results = []
          data.forEach(v => {
            const target = tableData.find(x => x.id === v.id)
            target ? results.push(target) : results.push(v)
          })
          this.getEditTableBInstance().loadData(results, 'cover')
        } else {
          this.getEditTableBInstance().loadData([], 'cover')
        }
      }
      done()
      this.forNotSettle.visible = false
    },
    clearTableDataB() {
      this.$nextTick(() => {
        if (this.getEditTableBInstance()) {
          this.getEditTableBInstance().loadData([], 'cover')
        }
      })
    },
    calcTotalMoney(v, column, { row }) {
      form.totalMoney = new BigNumber(row.payMoney).times(row.receiptRate).dp(2).toNumber()
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const ids = this.tableRows.map(v => v.id)

          this.getEditTableAInstance().validate(validSettles => {
            if (validSettles) {
              const { rowIndex, rule } = validSettles
              done()
              return this.$message.error(`结汇信息: 第${rowIndex + 1}行 ${rule.message}`)
            }
            const acctPaymentReceiptDTOList = this.getEditTableAInstance().getRecords()
            if (this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')) {
              this.getEditTableBInstance().validate(validPreSettles => {
                if (validPreSettles) {
                  const { rowIndex, rule } = validPreSettles
                  done()
                  return this.$message.error(`结汇记录: 第${rowIndex + 1}行 ${rule.message}`)
                }
                const acctPaymentOrderExportDTOList = this.getEditTableBInstance().getRecords()
                exportSettlementAcctReceipt(
                  Object.assign(
                    {
                      ids,
                      acctPaymentOrderExportDTOList: acctPaymentOrderExportDTOList.map(v => ({ orderId: v.id, payMoney: v.payMoney })),
                      acctPaymentReceiptDTOList: acctPaymentReceiptDTOList.map(v => ({
                        id: v.id,
                        payMoney: v.payMoney,
                        receiptCharge: v.receiptCharge
                      }))
                    },
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
              exportSettlementAcctReceipt(
                Object.assign(
                  { ids, acctPaymentReceiptDTOList: acctPaymentReceiptDTOList.map(v => ({ id: v.id, payMoney: v.payMoney })) },
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
            }
          })
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
    getEditTableAInstance() {
      return this.$refs.editTableARef
    },
    getEditTableBInstance() {
      return this.$refs.editTableBRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="98%"
    custom-class="common-form-dialog enter-form-claim-settle-dialog"
    title="认领结汇"
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <!-- 收款方信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          收款方信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="付款主体" prop="principalName">
              <business-autocomplete-basic
                v-model="form.principalName"
                label="付款主体"
                placeholder="请输入付款主体"
                :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                :auto-assign="{
                  principalId: 'id',
                  principalCompanyId: 'companyId'
                }"
                :form="form"
                @clear="() => ((form.principalId = 0), (form.principalCompanyId = 0))"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

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
        </base-row>

        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="是否预结汇" prop="beforeFlag">
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

      <!-- 结汇信息 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          结汇信息
        </span>
        <base-edit-table
          ref="editTableARef"
          max-height="300px"
          :show-added="false"
          :show-delete="false"
          :name="constant.TABLE_NAME_ACCT_RECEIPT_SETTLE_A"
        />
      </div>

      <!-- 结汇记录 -->
      <div v-if="form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')" class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          结汇记录
        </span>
        <base-edit-table ref="editTableBRef" max-height="300px" :show-added="false" :name="constant.TABLE_NAME_ACCT_RECEIPT_SETTLE_B">
          <template v-slot:buttons="{ selectRecords }">
            <el-button size="mini" type="primary" @click="handleCreate(selectRecords)">查询未结汇订单</el-button>
          </template>
        </base-edit-table>
      </div>
    </base-form>
    <for-no-settle
      v-model="forNotSettle.visible"
      :params="forNotSettle.params"
      :parent-details-table-instance="getEditTableBInstance"
      @save="handleForNotSettleSave"
    ></for-no-settle>
  </base-dialog>
</template>

<style lang="scss">
.enter-form-claim-settle-dialog {
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

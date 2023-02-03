<script>
import { getAcctPaymentById, saveAcctPayment, updateAcctPayment } from '@/api/finance/acct-payment'
import { getCompanyBank } from '@/api/company/company-bank'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'
import DetailsCreate from './details-create'

const form = {
  auditStatus: void 0,
  receiptCompanyType: enums.PAY_COMPANY_TYPE.getFieldByKey('SUPPLIER'),
  receiptCompanyName: '',
  receiptCompanyId: 0,
  customerId: 0,
  customerName: '',
  beforeFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
  payMode: '',
  principalName: '',
  principalId: 0,
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
  payUse: '',
  receiptBankName: '',
  receiptAccount: '',
  chargeBearType: '',
  remark: ''
}

export default {
  name: 'EnterForm',
  components: { DetailsCreate },
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
        receiptCompanyName: [{ required: true, message: '收款方必填' }],
        receiptBankName: [{ required: true, message: '收款银行名称必填' }],
        chargeBearType: [{ required: true, message: '手续费承担方式必填' }],
        receiptAccount: [{ required: true, message: '收款银行账号必填' }],
        payCurrency: [{ required: true, message: '付款币别必填' }],
        applyPayDate: [{ required: true, message: '申请付款日期必填' }],
        payMode: [{ required: true, message: '付款方式必填' }],
        payMoney: [{ required: true, message: '付款金额必填', validator: validatorNumRequired }]
      },
      dicts: {},
      detailsCreate: {
        visible: false,
        params: {}
      }
    }
  },
  computed: {
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
    },
    // 根据款项用途为出口结汇来禁用
    disabledByPayUseAsSettle() {
      return this.form.payUse === enums.PAY_USE.getFieldByKey('SETTLE')
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_PAY_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE, DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_PAY_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_CHARGE_BEAR_TYPE, DICTS_RECEIPT_MODE, DICTS_WHETHER_STATUS]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctPaymentById(this.tableRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts
          this.$nextTick(() => {
            this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[0])
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
            this.getDetailsEditTableInstance().loadData(
              (this.form.acctPaymentDetailVOList || []).map(v => ({
                ...v,
                verifyApMoney: v.verifyMoney
              })) || [],
              'cover'
            )
          } else if (this.rows.length) {
            await this.acctCostPayAssignment(this.rows)
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
    /** 明细列数据 */
    handleColumns() {
      return [
        // 付款单明细
        [
          { field: 'costPayNo', title: '应付编号', width: 150 },
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
            title: '费用大类',
            width: 120,
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COST_TYPE)
              }
            }
          },
          { field: 'costName', title: '费用名称', width: 130 },
          {
            field: 'verifyApMoney',
            width: 140,
            title: '核销金额',
            type: !this.disabledByPayUseAsSettle ? 'inputNumber' : false,
            attrs: {
              precision: 2
            },
            on: {
              blur: () => this.handleDeleteSelectRecords()
            }
          },
          { field: 'createByName', title: '创建人名称', width: 140 },
          { field: 'createTime', title: '创建时间', width: 160 }
        ]
      ]
    },
    handleReceiptCompanyTypeChange() {
      Object.assign(this.form, {
        receiptCompanyName: '',
        receiptCompanyId: 0
      })
    },
    async handleReceiptCompanyNameSelect(rows) {
      const { companyId, companyName } = rows[0]
      Object.assign(this.form, {
        receiptCompanyName: companyName,
        receiptCompanyId: companyId
      })

      if (this.form.receiptCompanyType === enums.PAY_COMPANY_TYPE.getFieldByKey('SUPPLIER')) {
        const res = await getCompanyBank({ companyId })
        const records = res.data.records
        if (records.length > 0) {
          const { bankName, accountCode } = records[0]
          Object.assign(this.form, {
            receiptBankName: bankName,
            receiptAccount: accountCode
          })
        }
      }
    },
    handleBeforeFlagChange() {
      this.getDetailsEditTableInstance().loadData([], 'cover')
    },
    async handleReceiptBankNameAddBeforeClick() {
      if (this.form.receiptCompanyId === 0) {
        this.$message.warning('请先选择已存在的收款方')
        return false
      }
      return true
    },
    handleCreate() {
      if (this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('YES')) return this.$message.warning('预付款的付款单不能新增付款明细')
      this.detailsCreate = {
        visible: true,
        params: {
          principalId: this.form.principalId,
          principalCompanyId: this.form.principalCompanyId,
          receiptCompanyType: this.form.receiptCompanyType,
          receiptCompanyId: this.form.receiptCompanyId,
          settleCurrency: this.form.payCurrency,
          customerId: this.form.customerId === 0 ? void 0 : this.form.customerId,
          verifyStatus: [enums.VERIFY_STATUS.getFieldByKey('UN_VERIFY'), enums.VERIFY_STATUS.getFieldByKey('PART_VERIFY')].join(',')
        }
      }
    },
    async handleDetailsCreateSave(data, done) {
      data.forEach(v => {
        v.costPayNo = v.costNo
        v.verifyApMoney = new BigNumber(Number(v.settleMoney)).minus(Number(v.verifyMoney)).dp(2).toNumber()
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
          this.getDetailsEditTableInstance().loadData(results, 'cover')
        } else {
          this.getDetailsEditTableInstance().loadData([], 'cover')
        }
      }
      this.handleDeleteSelectRecords()
      done()
      this.detailsCreate.visible = false
    },
    handleDeleteSelectRecords() {
      const tableData = this.getDetailsEditTableInstance().getRecords()
      const verifyApMoney = tableData.reduce((total, row) => {
        return new BigNumber(total).plus(Number(row.verifyApMoney)).dp(2).toNumber()
      }, 0)
      Object.assign(this.form, {
        payMoney: verifyApMoney,
        verifyMoney: verifyApMoney
      })
    },
    async acctCostPayAssignment(rows) {
      const {
        receiptCompanyType,
        receiptCompanyName,
        receiptCompanyId,
        settleDate: applyPayDate,
        settleCurrency: payCurrency,
        settleMoney: payMoney,
        customerId,
        customerName
      } = rows[0]
      Object.assign(this.form, {
        receiptCompanyType,
        receiptCompanyName,
        receiptCompanyId,
        applyPayDate: applyPayDate || dayjs().format('YYYY-MM-DD'),
        payCurrency,
        payMoney,
        customerId,
        customerName
      })
      if (this.form.receiptCompanyType === enums.PAY_COMPANY_TYPE.getFieldByKey('SUPPLIER')) {
        const res = await getCompanyBank({ companyId: receiptCompanyId })
        const records = res.data.records
        if (records.length > 0) {
          const { bankName, accountCode } = records[0]
          Object.assign(this.form, {
            receiptBankName: bankName,
            receiptAccount: accountCode
          })
        }
      }
      rows.forEach(v => {
        v.costPayNo = v.costNo
        v.verifyApMoney = new BigNumber(Number(v.settleMoney)).minus(Number(v.verifyMoney)).dp(2).toNumber()
      })
      await this.getDetailsEditTableInstance().loadData(rows, 'cover')
      // 用于重新计算付款金额和核销金额
      this.handleDeleteSelectRecords()
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`付款单明细: 第${rowIndex}行 ${rule.message}`)
            }
            const acctPaymentDetailVerifyDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign(
              {
                acctPaymentDetailVerifyDTOList: acctPaymentDetailVerifyDTOList.map(v => ({
                  costPayId: v.costPayId || v.id,
                  verifyMoney: v.verifyApMoney
                }))
              },
              this.form
            )
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveAcctPayment(formData)
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
              updateAcctPayment(formData)
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
    custom-class="common-form-dialog payment-order-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="112px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col v-if="type === enums.FORM_TYPE.getFieldByKey('ADDED')" :span="6">
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
            <base-form-item label="收款方类型" prop="receiptCompanyType">
              <base-select
                v-model="form.receiptCompanyType"
                placeholder="请选择收款方类型"
                :clearable="false"
                :options="dicts[constant.DICTS_PAY_COMPANY_TYPE]"
                @change="handleReceiptCompanyTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收款方" prop="receiptCompanyName">
              <business-autocomplete-basic
                v-model="form.receiptCompanyName"
                label="收款方"
                placeholder="请输入收款方"
                :module-name="receiptCompanyModuleName"
                :auto-assign="{
                  receiptCompanyId: 'companyId'
                }"
                :form="form"
                @select="handleReceiptCompanyNameSelect"
                @clear="() => (form.receiptCompanyId = 0)"
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
                :auto-assign="{
                  receiptBankName: 'bankName',
                  receiptAccount: 'accountCode'
                }"
                :form="form"
                :add-before-click="handleReceiptBankNameAddBeforeClick"
              ></business-autocomplete-bank>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收款银行账号" prop="receiptAccount">
              <base-input v-model="form.receiptAccount" placeholder="请输入收款银行账号"></base-input>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收款银行SWIFT" prop="receiptSwiftCode">
              <base-input v-model="form.receiptSwiftCode" placeholder="请输入收款银行SWIFT"></base-input>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="委托客户" prop="customerName">
              <business-autocomplete-basic
                v-model="form.customerName"
                label="委托客户"
                placeholder="请输入委托客户"
                :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                :auto-assign="{
                  customerId: 'id'
                }"
                :form="form"
                @clear="() => (form.customerId = 0)"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="是否预付款" prop="beforeFlag">
              <base-select
                v-model="form.beforeFlag"
                placeholder="请选择是否预付款"
                :clearable="false"
                :options="dicts[constant.DICTS_WHETHER_STATUS]"
                @change="handleBeforeFlagChange"
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
            <base-form-item label="申请付款日期" prop="applyPayDate">
              <base-date-picker v-model="form.applyPayDate" type="date" placeholder="选择申请付款日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="付款币别" prop="payCurrency">
              <business-autocomplete-basic
                v-model="form.payCurrency"
                label="付款币别"
                placeholder="请输入付款币别"
                :disabled="disabledByPayUseAsSettle"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="付款金额" prop="payMoney">
              <base-input-number v-model="form.payMoney" :disabled="disabledByPayUseAsSettle" placeholder="请输入付款金额" />
            </base-form-item>
          </base-col>

          <template v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')">
            <base-col :span="6">
              <base-form-item label="付款汇率" prop="payRate">
                <base-input-number
                  v-model="form.payRate"
                  :disabled="disabledByPayUseAsSettle"
                  :precision="6"
                  placeholder="请输入付款汇率"
                />
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
              <base-form-item label="付款主体" prop="principalName">
                <base-input v-model="form.principalName" disabled></base-input>
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
                <base-input v-model="form.serialNumber" placeholder="请输入银行流水号"></base-input>
              </base-form-item>
            </base-col>

            <base-col :span="12">
              <base-form-item label="备注" prop="remark">
                <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
              </base-form-item>
            </base-col>
          </template>
        </base-row>
      </div>

      <!-- 付款单明细 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          付款单明细
        </span>
        <base-edit-table
          ref="detailsEditTableRef"
          height="300px"
          :show-added="false"
          :show-delete="!disabledByPayUseAsSettle"
          :name="constant.TABLE_NAME_PAY_ORDER_ENTER"
          @delete="handleDeleteSelectRecords"
        >
          <template v-slot:buttons="{ selectRecords }">
            <el-button v-if="!disabledByPayUseAsSettle" size="mini" type="primary" @click="handleCreate(selectRecords)">生成</el-button>
          </template>
        </base-edit-table>
      </div>
    </base-form>
    <details-create
      v-model="detailsCreate.visible"
      :params="detailsCreate.params"
      :parent-details-table-instance="getDetailsEditTableInstance"
      @save="handleDetailsCreateSave"
    ></details-create>
  </base-dialog>
</template>

<style lang="scss">
.payment-order-dialog {
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

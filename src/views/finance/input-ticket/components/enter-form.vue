<script>
import { getAcctReceiveInvoiceById, saveAcctReceiveInvoice, updateAcctReceiveInvoice } from '@/api/finance/acct-receive-invoice'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'
import DetailsCreate from './details-create'

const form = {
  orderType: '',
  serviceTaxFlag: enums.SERVICE_TAX_FLAG.getFieldByKey('VAT'),
  taxDate: '',
  supplierId: 0,
  supplierName: '',
  totalMoney: 0,
  taxRate: '',
  cargoMoney: 0,
  taxMoney: 0,
  taxCode: '',
  taxNo: '',
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
    this.defaultConfig = {}
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        orderType: [{ required: true, message: '订单类型必填' }],
        serviceTaxFlag: [{ required: true, message: '发票类型必填' }],
        taxDate: [{ required: true, message: '发票日期必填' }],
        supplierName: [{ required: true, message: '供应商名称必填' }],
        totalMoney: [{ required: true, message: '开票总金额必填' }],
        cargoMoney: [{ required: true, message: '货款必填', validator: validatorNumRequired }],
        taxMoney: [{ required: true, message: '税额必填', validator: validatorNumRequired }],
        taxCode: [{ required: true, message: '发票代码必填' }],
        taxNo: [{ required: true, message: '发票号码必填' }]
      },
      dicts: {},
      orderTypes: [],
      detailsCreate: {
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
        this.form = clone(form, true)
        const { DICTS_ORDER_TYPE, DICTS_SERVICE_TAX_FLAG, DICTS_TAX_RATE } = constant
        Promise.all([
          getDataDictionary([DICTS_ORDER_TYPE, DICTS_SERVICE_TAX_FLAG, DICTS_TAX_RATE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getAcctReceiveInvoiceById(this.tableRow.id),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_TAX_POINT)
        ]).then(async ([dicts, info, defaultConfigRes]) => {
          this.defaultConfig = defaultConfigRes.data
          this.dicts = dicts
          this.orderTypes = this.dicts[DICTS_ORDER_TYPE].filter(v => v.value === enums.ORDER_TYPE.getFieldByKey('EXPORT'))

          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data, {
              taxRate: String(info.data.taxRate)
            })
            this.$nextTick(() => {
              if (this.form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('SERVICE')) {
                this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[1])
              } else if (this.form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')) {
                this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[0])
              }
              this.getDetailsEditTableInstance().loadData(this.form.acctReceiveInvoiceRelationVOList || [], 'cover')
            })
          } else {
            this.$nextTick(() => {
              this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[0])
            })
            this.form.taxRate = String(this.defaultConfig.vatPoint)
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
        // 订单明细
        [
          { field: 'orderNo', width: 140, title: '订单编号' },
          { field: 'productModel', width: 120, title: '型号' },
          { field: 'productName', width: 120, title: '品名' },
          {
            field: 'receiveName',
            title: '开票名称',
            width: 120,
            type: 'input',
            rules: [{ required: true, message: '开票名称必填' }]
          },
          { field: 'productUnit', width: 100, title: '单位' },
          { field: 'allQty', width: 100, title: '总数量', visible: this.type === enums.FORM_TYPE.getFieldByKey('ADDED') },
          { field: 'receiveInvoiceQty', width: 100, title: '已开票数量', visible: this.type === enums.FORM_TYPE.getFieldByKey('ADDED') },
          {
            field: 'qty',
            title: '本次开票数量',
            width: 130,
            sum: true,
            type: 'inputNumber',
            footerConfig: {
              precision: 6
            },
            attrs: {
              precision: 6
            },
            on: {
              blur: (v, column, scope) => this.calcOrderPrice(v, column, scope, 'qty')
            }
          },
          {
            field: 'price',
            width: 100,
            title: '开票单价',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          {
            field: 'totalMoney',
            title: '本次开票金额',
            width: 130,
            sum: true,
            type: 'inputNumber',
            attrs: {
              precision: 2
            },
            on: {
              blur: (v, column, scope) => this.calcOrderPrice(v, column, scope, 'totalMoney')
            }
          },
          {
            field: 'cargoMoney',
            title: '货款',
            width: 100,
            sum: true,
            rules: [{ required: true, message: '货款必填' }],
            type: 'inputNumber',
            attrs: {
              precision: 2
            }
          },

          {
            field: 'taxMoney',
            title: '税额',
            width: 100,
            sum: true,
            rules: [{ required: true, message: '货款必填' }],
            type: 'inputNumber',
            attrs: {
              precision: 2
            }
          },

          {
            field: 'serviceName',
            title: '税收分类名称',
            width: 140,
            type: 'custom',
            customRender: (h, { row, column }) => {
              return (
                <business-autocomplete-basic
                  vModel={row[column.field]}
                  size="mini"
                  module-name={constant.AUTOCOMPLETE_KEY_TAX_CATEGORY}
                  label="税收分类名称"
                  auto-assign={{
                    codeNum: 'codeNum'
                  }}
                  form={row}
                  onClear={() => (row.codeNum = '')}
                />
              )
            }
          },
          { field: 'codeNum', width: 130, title: '税收分类编码', type: 'input' },
          { field: 'remark', title: '备注', type: 'input', width: 120 }
        ],
        // 发票明细
        [
          {
            field: 'receiveName',
            title: '开票名称',
            width: 120,
            type: 'input',
            rules: [{ required: true, message: '开票名称必填' }]
          },
          {
            field: 'productUnit',
            title: '单位',
            width: 150,
            type: 'custom',
            customRender: (h, { row, column }) => {
              return (
                <business-autocomplete-basic
                  vModel={row[column.field]}
                  size="mini"
                  module-name={constant.AUTOCOMPLETE_KEY_PRODUCT_UNIT}
                  label="单位"
                  placeholder="请输入单位"
                />
              )
            }
          },
          {
            field: 'totalMoney',
            title: '本次开票金额',
            width: 130,
            sum: true,
            type: 'inputNumber',
            attrs: {
              precision: 2
            },
            on: {
              blur: (v, column, scope) => this.calcPrice(v, column, scope, 'totalMoney')
            }
          },

          {
            field: 'cargoMoney',
            title: '货款',
            width: 100,
            sum: true,
            rules: [{ required: true, message: '货款必填' }],
            type: 'inputNumber',
            attrs: {
              precision: 2
            }
          },

          {
            field: 'taxMoney',
            title: '税额',
            width: 100,
            sum: true,
            rules: [{ required: true, message: '货款必填' }],
            type: 'inputNumber',
            attrs: {
              precision: 2
            }
          },

          {
            field: 'serviceName',
            title: '税收分类名称',
            width: 140,
            type: 'custom',
            customRender: (h, { row, column }) => {
              return (
                <business-autocomplete-basic
                  vModel={row[column.field]}
                  size="mini"
                  module-name={constant.AUTOCOMPLETE_KEY_TAX_CATEGORY}
                  label="税收分类名称"
                  auto-assign={{
                    codeNum: 'codeNum'
                  }}
                  form={row}
                  onClear={() => (row.codeNum = '')}
                />
              )
            }
          },
          { field: 'codeNum', width: 130, title: '税收分类编码', type: 'input' }
        ]
      ]
    },
    handleServiceTaxFlagChange(v) {
      // 发票类型增值税发票税率取参数管理的增值税点
      // 发票类型服务费发票税率取参数管理的服务税点
      this.form.taxRate = String(
        v === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') ? this.defaultConfig.vatPoint : this.defaultConfig.servicePoint
      )
      if (v === enums.SERVICE_TAX_FLAG.getFieldByKey('SERVICE')) {
        this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[1])
      } else if (v === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')) {
        this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[0])
      }
      this.$nextTick(() => {
        this.getDetailsEditTableInstance().clearSelectRows()
        this.getDetailsEditTableInstance().loadData([], 'cover')
      })
    },
    handleSupplierSelect(rows) {
      const { id } = rows[0]
      this.form.supplierId = id
      if (this.getDetailsEditTableInstance()) {
        this.getDetailsEditTableInstance().clearSelectRows()
        this.getDetailsEditTableInstance().loadData([], 'cover')
      }
    },
    handleSupplierClear() {
      this.form.supplierId = 0
      if (this.getDetailsEditTableInstance()) {
        this.getDetailsEditTableInstance().clearSelectRows()
        this.getDetailsEditTableInstance().loadData([], 'cover')
      }
    },
    calcPrice(v, column, scope, type) {
      const { row } = scope
      if (type === 'totalMoney') {
        if (row.qty) {
          row.price = new BigNumber(row.totalMoney).div(row.qty).dp(6).toNumber() || 0
        }
      } else {
        row.totalMoney = new BigNumber(row.qty).div(row.price).dp(2).toNumber()
      }
      // 算货款 开票总价/（1+增值税率）
      const n1 = new BigNumber(1).plus(Number(this.form.taxRate)).dp(2).toNumber()
      row.cargoMoney = new BigNumber(row.totalMoney).div(n1).dp(2).toNumber() || 0
      // 算税额 税款 = 开票总价 - 货款
      row.taxMoney = new BigNumber(row.totalMoney).minus(Number(row.cargoMoney)).dp(2).toNumber()
    },
    calcOrderPrice(v, column, scope, type) {
      const { row } = scope
      if (type !== 'totalMoney') {
        row.totalMoney = new BigNumber(row.qty).times(Number(row.price)).dp(2).toNumber()
      } else {
        if (row.price !== 0) {
          row.qty = new BigNumber(row.totalMoney).div(Number(row.price)).dp(2).toNumber()
        }
      }
      // 算货款 开票总价/（1+增值税率）
      const n1 = new BigNumber(1).plus(Number(this.form.taxRate)).dp(2).toNumber()
      row.cargoMoney = new BigNumber(row.totalMoney).div(n1).dp(2).toNumber() || 0
      // 算税额 税款 = 开票总价 - 货款
      row.taxMoney = new BigNumber(row.totalMoney).minus(Number(row.cargoMoney)).dp(2).toNumber()
    },
    handleTotalMoneyBlur() {
      // 算货款 开票总价/（1+增值税率)
      const n1 = new BigNumber(1).plus(Number(this.form.taxRate)).dp(2).toNumber()
      this.form.cargoMoney = new BigNumber(this.form.totalMoney).div(n1).dp(2).toNumber() || 0
      // 算税额 税款 = 开票总价 - 货款
      this.form.taxMoney = new BigNumber(this.form.totalMoney).minus(Number(this.form.cargoMoney)).dp(2).toNumber()
    },
    handleCreate() {
      if (this.form.orderType === '') return this.$message.error('请先选择订单类型')
      if (this.form.supplierName === '') return this.$message.error('请先选择开票供应商')
      this.detailsCreate = {
        visible: true,
        params: {
          supplierId: this.form.supplierId,
          orderType: this.form.orderType,
          taxInvoiceId: this.tableRow.id
        }
      }
    },
    async handleDetailsCreateSave(data, done) {
      data.forEach(v => {
        v.orderDetailId = v.id
        v.receiveName = v.productName
        v.price = v.purchasePrice
        v.qty = new BigNumber(v.allQty).minus(v.receiveInvoiceQty).toNumber()
        v.totalMoney = new BigNumber(v.qty).times(v.price).dp(2).toNumber() || 0
        // 算货款 开票总价/（1+增值税率）
        const n1 = new BigNumber(1).plus(Number(this.form.taxRate)).dp(2).toNumber()
        v.cargoMoney = new BigNumber(v.totalMoney).div(n1).dp(2).toNumber() || 0
        // 算税额 税款 = 开票总价 - 货款
        v.taxMoney = new BigNumber(v.totalMoney).minus(Number(v.cargoMoney)).dp(2).toNumber()
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
      done()
      this.detailsCreate.visible = false
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(
                `${this.form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') ? '订单明细' : '开票明细'}: 第${rowIndex}行 ${
                  rule.message
                }`
              )
            }
            const acctReceiveInvoiceDetailDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign(
              {
                acctReceiveInvoiceDetailDTOList: acctReceiveInvoiceDetailDTOList.map(v => ({
                  ...v,
                  id: this.type === enums.FORM_TYPE.getFieldByKey('ADDED') ? 0 : v.id,
                  orderType: this.form.orderType
                }))
              },
              this.form
            )
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveAcctReceiveInvoice(formData)
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
              updateAcctReceiveInvoice(formData)
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
    custom-class="common-form-dialog receive-invoice-dialog"
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
          <base-col :span="6">
            <base-form-item label="订单类型" prop="orderType">
              <base-select
                v-model="form.orderType"
                placeholder="请选择订单类型"
                :disabled="type !== enums.FORM_TYPE.getFieldByKey('ADDED')"
                :options="orderTypes"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="发票类型" prop="serviceTaxFlag">
              <base-select
                v-model="form.serviceTaxFlag"
                placeholder="请选择发票类型"
                :disabled="type !== enums.FORM_TYPE.getFieldByKey('ADDED')"
                :options="dicts[constant.DICTS_SERVICE_TAX_FLAG]"
                :clearable="false"
                @change="handleServiceTaxFlagChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="发票日期" prop="taxDate">
              <base-date-picker v-model="form.taxDate" placeholder="选择发票日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="开票供应商" prop="supplierName">
              <business-autocomplete-basic
                v-model="form.supplierName"
                :disabled="type !== enums.FORM_TYPE.getFieldByKey('ADDED')"
                label="开票供应商"
                placeholder="请输入开票供应商"
                :module-name="constant.AUTOCOMPLETE_KEY_SUPPLIER"
                @select="handleSupplierSelect"
                @clear="handleSupplierClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="开票总金额" prop="totalMoney">
              <base-input-number v-model="form.totalMoney" placeholder="请输入开票总金额" :precision="2" @blur="handleTotalMoneyBlur" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="税率" prop="taxRate">
              <base-select
                v-model="form.taxRate"
                placeholder="请选择税率"
                disabled
                :clearable="false"
                :options="dicts[constant.DICTS_TAX_RATE]"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="货款" prop="cargoMoney">
              <base-input-number v-model="form.cargoMoney" placeholder="请输入货款" :precision="2" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="税额" prop="taxMoney">
              <base-input-number v-model="form.taxMoney" placeholder="请输入税额" :precision="2" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="发票代码" prop="taxCode">
              <base-input v-model="form.taxCode" placeholder="请输入发票代码" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="发票号码" prop="taxNo">
              <base-input v-model="form.taxNo" placeholder="请输入发票号码" />
            </base-form-item>
          </base-col>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="12">
            <base-form-item label="发票备注" prop="remark" class="form-item-textarea">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入发票备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 订单明细/开票明细 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          {{ form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') ? '订单明细' : '开票明细' }}
        </span>
        <base-edit-table
          ref="detailsEditTableRef"
          height="300px"
          show-footer
          :show-added="form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('SERVICE')"
          :name="constant.TABLE_NAME_INPUT_TICKET_ENTER"
        >
          <template v-slot:buttons="{ selectRecords }">
            <el-button
              v-if="form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')"
              size="mini"
              type="primary"
              @click="handleCreate(selectRecords)"
              >生成</el-button
            >
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
.receive-invoice-dialog {
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

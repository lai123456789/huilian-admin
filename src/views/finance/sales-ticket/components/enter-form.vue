<script>
import { saveAcctMakeInvoice } from '@/api/finance/acct-make-invoice'
import { getCompanyInvoice } from '@/api/company/company-invoice'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { validatorNumRequired } from '@/utils/validate'
import constant from '@/constant'
import enums from '@/enums'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import BigNumber from '@/utils/big-number'
import DetailsCreateA from './details-create-a'
import DetailsCreateB from './details-create-b'
import DetailsCreateC from './details-create-c'
import DetailsCreateD from './details-create-d'

const form = {
  orderType: '',
  customerId: 0,
  companyId: 0,
  customerName: '',
  realInvoiceTitle: void 0,
  invoiceTitle: '',
  invoiceType: '',
  invoiceMakeType: enums.SERVICE_TAX_FLAG.getFieldByKey('VAT'),
  beforeFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
  rate: 0,
  bankName: '',
  bankNo: '',
  registerAddress: '',
  registerTel: '',
  allMoney: 0,
  diffMoney: 0,
  totalMoney: 0,
  cargoMoney: 0,
  taxMoney: 0,
  taxRate: '',
  creditCode: '',
  taxDate: '',
  taxCode: '',
  taxNo: '',
  remark: ''
}

export default {
  name: 'EnterForm',
  components: {
    DetailsCreateA,
    DetailsCreateB,
    DetailsCreateC,
    DetailsCreateD
  },
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
        customerName: [{ required: true, message: '客户名称必填' }],
        invoiceTitle: [{ required: true, message: '发票抬头必填' }],
        invoiceMakeType: [{ required: true, message: '发票类型必填' }],
        rate: [{ required: true, message: '提前开票汇率必填', validator: validatorNumRequired }],
        invoiceType: [{ required: true, message: '发票开具类型必填' }],
        creditCode: [{ required: true, message: '纳税识别号必填' }]
      },
      dicts: {},
      activeName: '开票订单',
      detailsCreateA: {
        visible: false,
        params: {}
      },
      detailsCreateB: {
        visible: false,
        params: {}
      },
      detailsCreateC: {
        visible: false,
        params: {}
      },
      detailsCreateD: {
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
        this.activeName = '开票订单'
        this.form = clone(form, true)
        const { DICTS_TAX_RATE, DICTS_ORDER_TYPE, DICTS_WHETHER_STATUS, DICTS_INVOICE_TYPE, DICTS_SERVICE_TAX_FLAG } = constant
        Promise.all([
          getDataDictionary([DICTS_TAX_RATE, DICTS_ORDER_TYPE, DICTS_WHETHER_STATUS, DICTS_INVOICE_TYPE, DICTS_SERVICE_TAX_FLAG]),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_TAX_POINT)
        ]).then(([dicts, defaultConfigRes]) => {
          this.dicts = dicts

          this.defaultConfig = defaultConfigRes.data

          this.form.taxRate = String(
            this.form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')
              ? this.defaultConfig.vatPoint
              : this.defaultConfig.servicePoint
          )

          this.$nextTick(() => {
            this.getTableAInstance().loadColumns(this.handleColumns()[0])
            this.getTableCInstance().loadColumns(this.handleColumns()[2])
            this.getTableDInstance().loadColumns(this.handleColumns()[3])
          })
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
        // 开票订单
        [
          { field: 'orderNo', title: '订单编号', width: 160 },
          { field: 'customerName', title: '客户名称', width: 160 },
          {
            field: 'cargoMoney',
            title: '货款',
            width: 120,
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'taxMoney',
            title: '税额',
            width: 120,
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'makeInvoiceMoney',
            title: '开票金额',
            width: 120,
            sum: true,
            formatter: {
              type: 'number'
            }
          }
        ],
        // 开票商品明细
        [
          { field: 'orderNo', width: 140, title: '订单编号' },
          { field: 'productModel', width: 150, title: '型号' },
          { field: 'name', width: 140, title: '名称' },
          { field: 'productUnit', width: 100, title: '单位' },
          {
            field: 'price',
            width: 130,
            title: '单价',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          { field: 'qty', width: 100, title: '数量' },
          { field: 'makeInvoiceQty', width: 100, title: '已开票数量' },
          {
            field: 'currentQty',
            width: 130,
            title: '本次开票数量',
            type: 'inputNumber',
            sum: true,
            footerConfig: {
              precision: 6
            },
            attrs: {
              precision: 6
            },
            on: {
              blur: (v, column, scope) => this.calcGoodsPrice(v, column, scope, 'currentQty')
            }
          },
          {
            field: 'totalMoney',
            width: 130,
            title: '本次开票金额',
            type: 'inputNumber',
            sum: true,
            attrs: {
              precision: 2
            },
            on: {
              blur: (v, column, scope) => this.calcGoodsPrice(v, column, scope, 'totalMoney')
            }
          }
        ],
        // 服务费项目
        [
          { field: 'costNo', title: '应收编号', width: 160 },
          { field: 'orderNo', title: '订单编号', width: 160 },
          {
            field: 'costType',
            title: '费用大类',
            width: 160,
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COST_TYPE)
              }
            }
          },
          { field: 'costName', title: '费用名称', width: 160 },
          {
            field: 'settleMoney',
            title: '开票金额',
            width: 120,
            sum: true,
            formatter: {
              type: 'number'
            }
          }
        ],
        // 关联票差
        [
          { field: 'invoiceDiffNo', width: 140, title: '票差单号' },
          { field: 'orderNo', width: 140, title: '订单编号' },
          {
            field: 'totalMoney',
            title: '票差金额',
            width: 120,
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'deductMoney',
            title: '已抵扣票差金额',
            width: 120,
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'unDeductMoney',
            title: '未抵扣票差金额',
            width: 120,
            sum: true,
            formatter: {
              type: 'number'
            }
          },
          {
            field: 'diffTotalMoney',
            width: 140,
            title: '本次抵扣票差金额',
            type: 'inputNumber',
            sum: true,
            attrs: {
              precision: 2
            },
            on: {
              blur: () => this.cumulaAllDiffMoneyByDetails()
            }
          }
        ]
      ]
    },
    handleOrderTypeChange() {
      this.form.allMoney = 0
      this.clearAllGridData()
    },
    async handleCustomerSelect(rows) {
      const { id, companyId, companyName } = rows[0]

      Object.assign(this.form, {
        customerId: id,
        companyId,
        customerName: companyName,
        allMoney: 0,
        diffMoney: 0
      })

      this.clearAllGridData()

      // 切换客户时，清空一下关联票差数据
      if (this.getTableDInstance()) {
        await this.getTableDInstance().loadData([], 'cover')
      }

      /* 查询客户下的开票资料 */
      getCompanyInvoice({ companyId }).then(res => {
        const records = res.data.records
        const obj = {}
        if (records.length > 0) {
          /* 默认带第一条 */
          const { invoiceTitle, invoiceType, bankName, bankNo, registerAddress, registerTel, creditCode } = records[0]
          Object.assign(obj, { invoiceTitle, invoiceType, bankName, bankNo, registerAddress, registerTel, creditCode })
        } else {
          Object.assign(obj, {
            invoiceTitle: '',
            invoiceType: '',
            bankName: '',
            bankNo: '',
            registerAddress: '',
            registerTel: '',
            creditCode: ''
          })
        }
        const { invoiceTitle, invoiceType, bankName, bankNo, registerAddress, registerTel, creditCode } = obj
        Object.assign(this.form, {
          invoiceTitle,
          invoiceType,
          bankName,
          bankNo,
          registerAddress,
          registerTel,
          creditCode
        })
      })
    },
    handleCustomerClear() {
      Object.assign(this.form, {
        customerId: 0,
        companyId: 0,
        invoiceTitle: '',
        invoiceType: '',
        bankName: '',
        bankNo: '',
        registerAddress: '',
        registerTel: '',
        creditCode: ''
      })
    },
    handleInvoiceMakeTypeChange(v) {
      // 发票类型增值税发票税率取参数管理的增值税点
      // 发票类型服务费发票税率取参数管理的服务税点
      Object.assign(this.form, {
        beforeFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
        rate: 0,
        allMoney: 0,
        diffMoney: 0,
        taxRate: String(v === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') ? this.defaultConfig.vatPoint : this.defaultConfig.servicePoint)
      })

      if (v === enums.INVOICE_TYPE.getFieldByKey('VAT_INVOICE')) {
        this.activeName = '开票订单'
      } else if (v === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE')) {
        this.activeName = '服务费项目'
      }

      this.clearAllGridData()
    },
    handleBeforeFlagChange(v) {
      Object.assign(this.form, {
        allMoney: 0,
        diffMoney: 0
      })
      // 每次切换时需要清空数据
      this.$nextTick(async () => {
        if (v === enums.WHETHER_STATUS.getFieldByKey('NO')) {
          this.activeName = '开票订单'
          this.$nextTick(() => {
            this.getTableAInstance().loadColumns(this.handleColumns()[0])
          })
        } else if (v === enums.WHETHER_STATUS.getFieldByKey('YES')) {
          this.activeName = '开票商品明细'
          this.$nextTick(() => {
            this.getTableBInstance().loadColumns(this.handleColumns()[1])
          })
        }
        this.clearAllGridData()
      })
    },
    // 提前开票汇率失去焦点重新计算开票商品明细的开票总金额
    handleBeforeFlagBlur() {
      const records = this.getTableBInstance().getRecords()
      records.forEach(v => {
        v.totalMoney = new BigNumber(v.currentQty).times(v.price).times(Number(this.form.rate)).dp(2).toNumber()
      })
      this.cumulaAllMoneyByDetails()
    },
    // 根据下面的明细总金额累加成加税合计
    async cumulaAllMoneyByDetails() {
      let cargoTotal = 0
      let serveTotal = 0
      let goodsTotal = 0

      if (this.getTableAInstance()) {
        const records = await this.getTableAInstance().getRecords()
        cargoTotal = records.reduce((total, row) => {
          return new BigNumber(total).plus(row.makeInvoiceMoney).dp(2).toNumber()
        }, 0)
      }

      if (this.getTableCInstance()) {
        const records = await this.getTableCInstance().getRecords()
        serveTotal = records.reduce((total, row) => {
          return new BigNumber(total).plus(row.makeInvoiceMoney).dp(2).toNumber()
        }, 0)
      }

      if (this.getTableBInstance()) {
        const records = await this.getTableBInstance().getRecords()
        goodsTotal = records.reduce((total, row) => {
          return new BigNumber(total).plus(row.totalMoney).dp(2).toNumber()
        }, 0)
      }

      this.form.allMoney = new BigNumber(cargoTotal).plus(serveTotal).plus(goodsTotal).dp(2).toNumber()
    },
    // 根据下面的关联票差明细本次抵扣票差金额
    async cumulaAllDiffMoneyByDetails() {
      let ticketDiffTotal = 0

      if (this.getTableDInstance()) {
        const records = await this.getTableDInstance().getRecords()
        ticketDiffTotal = records.reduce((total, row) => {
          return new BigNumber(total).plus(row.diffTotalMoney).dp(2).toNumber()
        }, 0)
      }

      this.form.diffMoney = ticketDiffTotal
    },
    // 开票订单生成
    handleCreateA() {
      if (this.form.orderType === '') return this.$message.error('请先选择订单类型')
      if (this.form.customerId === 0) return this.$message.error('请先选择客户')

      this.detailsCreateA = {
        visible: true,
        params: {
          orderType: this.form.orderType,
          customerId: this.form.customerId
        }
      }
    },
    // 开票订单生成保存
    async handleCreateASave(data, done) {
      data.forEach(v => {
        v.orderId = v.id
      })
      const tableData = this.getTableAInstance().getRecords()
      if (!tableData.length) {
        await this.getTableAInstance().loadData(data, 'cover')
      } else if (tableData.length > 0) {
        if (data.length > 0) {
          const results = []
          data.forEach(v => {
            const target = tableData.find(x => x.id === v.id)
            target ? results.push(target) : results.push(v)
          })
          this.getTableAInstance().loadData(results, 'cover')
        } else {
          this.getTableAInstance().loadData([], 'cover')
        }
      }
      await this.cumulaAllMoneyByDetails()
      done()
      this.detailsCreateA.visible = false
    },

    // 开票商品明细生成
    handleCreateB() {
      if (this.form.orderType === '') return this.$message.error('请先选择订单类型')
      if (this.form.customerId === 0) return this.$message.error('请先选择客户')

      this.detailsCreateB = {
        visible: true,
        params: {
          orderType: this.form.orderType,
          customerId: this.form.customerId
        }
      }
    },
    // 开票商品明细生成保存
    async handleCreateBSave(data, done) {
      data.forEach(v => {
        v.orderDetailId = v.id
        v.name = v.customsName || v.productName
        v.currentQty = new BigNumber(v.qty).minus(v.makeInvoiceQty).toNumber()
        v.totalMoney = new BigNumber(v.currentQty).times(v.price).times(Number(this.form.rate)).dp(2).toNumber()
      })
      const tableData = this.getTableBInstance().getRecords()
      if (!tableData.length) {
        await this.getTableBInstance().loadData(data, 'cover')
      } else if (tableData.length > 0) {
        if (data.length > 0) {
          const results = []
          data.forEach(v => {
            const target = tableData.find(x => x.id === v.id)
            target ? results.push(target) : results.push(v)
          })
          this.getTableBInstance().loadData(results, 'cover')
        } else {
          this.getTableBInstance().loadData([], 'cover')
        }
      }
      await this.cumulaAllMoneyByDetails()
      done()
      this.detailsCreateB.visible = false
    },

    // 服务费项目生成
    handleCreateC() {
      if (this.form.orderType === '') return this.$message.error('请先选择订单类型')
      if (this.form.customerId === 0) return this.$message.error('请先选择客户')

      this.detailsCreateC = {
        visible: true,
        params: {
          costType: [enums.COST_TYPE.getFieldByKey('AGENCY'), enums.COST_TYPE.getFieldByKey('VARIED')].join(','),
          orderType: this.form.orderType,
          payCompanyId: this.form.companyId
        }
      }
    },
    // 服务费项目生成保存
    async handleCreateCSave(data, done) {
      data.forEach(v => {
        v.costInvoiceId = v.id
      })
      const tableData = this.getTableCInstance().getRecords()
      if (!tableData.length) {
        await this.getTableCInstance().loadData(data, 'cover')
      } else if (tableData.length > 0) {
        if (data.length > 0) {
          const results = []
          data.forEach(v => {
            const target = tableData.find(x => x.id === v.id)
            target ? results.push(target) : results.push(v)
          })
          this.getTableCInstance().loadData(results, 'cover')
        } else {
          this.getTableCInstance().loadData([], 'cover')
        }
      }
      await this.cumulaAllMoneyByDetails()
      done()
      this.detailsCreateC.visible = false
    },

    // 关联票差生成
    handleCreateD() {
      if (this.form.customerId === 0) return this.$message.error('请先选择客户')

      this.detailsCreateD = {
        visible: true,
        params: {
          companyId: this.form.companyId
        }
      }
    },
    // 关联票差生成保存
    async handleCreateDSave(data, done) {
      const tableData = this.getTableDInstance().getRecords()
      if (!tableData.length) {
        await this.getTableDInstance().loadData(data, 'cover')
      } else if (tableData.length > 0) {
        if (data.length > 0) {
          const results = []
          data.forEach(v => {
            const target = tableData.find(x => x.id === v.id)
            target ? results.push(target) : results.push(v)
          })
          this.getTableDInstance().loadData(results, 'cover')
        } else {
          this.getTableDInstance().loadData([], 'cover')
        }
      }
      done()
      this.detailsCreateD.visible = false
    },
    // 清空下面所有表格的数据
    clearAllGridData() {
      this.$nextTick(async () => {
        if (this.getTableAInstance()) {
          this.getTableAInstance().loadData([], 'cover')
        }

        if (this.getTableBInstance()) {
          this.getTableBInstance().loadData([], 'cover')
        }

        if (this.getTableCInstance()) {
          this.getTableCInstance().loadData([], 'cover')
        }

        if (this.getTableCInstance()) {
          this.getTableCInstance().loadData([], 'cover')
        }
      })
    },
    calcGoodsPrice(v, column, scope, type) {
      const { row } = scope
      if (type === 'currentQty') {
        row.totalMoney = new BigNumber(row.currentQty).times(row.price).times(Number(this.form.rate)).dp(2).toNumber()
      }
      this.$nextTick(() => {
        this.cumulaAllMoneyByDetails()
      })
    },
    handleValidateSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (!valid) {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
          return
        }

        // 增值税发票 -> 提前开票
        if (
          this.type === enums.FORM_TYPE.getFieldByKey('ADDED') &&
          this.form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') &&
          this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('YES')
        ) {
          if (this.getTableBInstance() && this.getTableDInstance()) {
            this.getTableBInstance().validate(valids => {
              if (valids) {
                const { rowIndex, rule } = valids
                return this.$message.error(`开票商品明细: 第${rowIndex + 1}行 ${rule.message}`)
              }
              this.getTableDInstance().validate(valids => {
                if (valids) {
                  const { rowIndex, rule } = valids
                  return this.$message.error(`关联票差明细: 第${rowIndex + 1}行 ${rule.message}`)
                }
                this.handleSave(done, this.form)
              })
            })
          }
          // 增值税发票 -> 不是提前开票
        } else if (
          this.type === enums.FORM_TYPE.getFieldByKey('ADDED') &&
          this.form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') &&
          this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')
        ) {
          if (this.getTableDInstance()) {
            this.getTableDInstance().validate(valids => {
              if (valids) {
                const { rowIndex, rule } = valids
                return this.$message.error(`关联票差明细: 第${rowIndex + 1}行 ${rule.message}`)
              }
              this.handleSave(done, this.form)
            })
          }
        } else {
          this.handleSave(done, this.form)
        }
      })
    },
    handleSave(done, form) {
      if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
        let orderItemList = []
        let serviceItemList = []
        let productItemList = []
        let acctMakeInvoiceDiffDTOList = []
        if (this.getTableAInstance()) {
          orderItemList = (this.getTableAInstance().getRecords() || []).map(v => ({
            orderId: v.orderId,
            orderType: this.form.orderType
          }))
        }
        if (this.getTableCInstance()) {
          serviceItemList = (this.getTableCInstance().getRecords() || []).map(v => ({
            orderId: v.orderId,
            costInvoiceId: v.costInvoiceId,
            orderType: this.form.orderType
          }))
        }
        if (this.getTableBInstance()) {
          productItemList = (this.getTableBInstance().getRecords() || []).map(v => ({
            qty: v.currentQty,
            totalMoney: v.totalMoney,
            remark: v.remark,
            orderId: v.orderId,
            orderDetailId: v.orderDetailId,
            orderType: this.form.orderType
          }))
        }
        if (this.getTableDInstance()) {
          acctMakeInvoiceDiffDTOList = (this.getTableDInstance().getRecords() || []).map(v => ({
            diffTotalMoney: v.diffTotalMoney,
            invoiceDiffId: v.id
          }))
        }
        const acctTaxInvoiceSaveDTO = Object.assign({ orderItemList, serviceItemList, acctMakeInvoiceDiffDTOList, productItemList }, form)

        saveAcctMakeInvoice(acctTaxInvoiceSaveDTO)
          .then(() => {
            this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}成功`)
            this.visible = false
            done()
            this.reLoad(false)
          })
          .catch(() => {
            done()
          })
      }
    },
    getFormInstance() {
      return this.$refs.formRef
    },
    // 开票订单表格组件实例
    getTableAInstance() {
      return this.$refs.editTableARef
    },
    // 开票商品明细表格组件实例
    getTableBInstance() {
      return this.$refs.editTableBRef
    },
    // 服务费项目表格组件实例
    getTableCInstance() {
      return this.$refs.editTableCRef
    },
    // 关联票差表格组件实例
    getTableDInstance() {
      return this.$refs.editTableDRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="99%"
    custom-class="common-form-dialog sales-ticket-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleValidateSave"
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
            <base-form-item label="订单类型" prop="orderType">
              <base-select
                v-model="form.orderType"
                placeholder="请选择订单类型"
                :options="dicts[constant.DICTS_ORDER_TYPE]"
                @change="handleOrderTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="客户名称" prop="customerName">
              <business-autocomplete-basic
                v-model="form.customerName"
                label="客户名称"
                placeholder="请输入客户名称"
                :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                @select="handleCustomerSelect"
                @clear="handleCustomerClear"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="发票类型" prop="invoiceMakeType">
              <base-select
                v-model="form.invoiceMakeType"
                placeholder="请选择发票类型"
                :options="dicts[constant.DICTS_SERVICE_TAX_FLAG]"
                :clearable="false"
                @change="handleInvoiceMakeTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="发票抬头" prop="invoiceTitle">
              <business-autocomplete-basic
                v-model="form.invoiceTitle"
                label="发票抬头"
                placeholder="请输入发票抬头"
                :module-name="constant.AUTOCOMPLETE_KEY_CUS_MAKE_INVOICE"
                :params="{
                  companyId: form.companyId
                }"
                :auto-assign="{
                  invoiceType: 'invoiceType',
                  bankName: 'bankName',
                  bankNo: 'bankNo',
                  registerAddress: 'registerAddress',
                  registerTel: 'registerTel',
                  creditCode: 'creditCode'
                }"
                :form="form"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="纳税识别号" prop="creditCode">
              <base-input v-model="form.creditCode" placeholder="请输入纳税识别号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="发票开具类型" prop="invoiceType">
              <base-select v-model="form.invoiceType" placeholder="请选择发票开具类型" :options="dicts[constant.DICTS_INVOICE_TYPE]" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              label="开户银行名称"
              prop="bankName"
              :rules="[
                { required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'), message: '开户银行名称必填' }
              ]"
            >
              <base-input v-model="form.bankName" placeholder="请输入开户银行名称" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              label="开户银行账号"
              prop="bankNo"
              :rules="[
                { required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'), message: '开户银行名称必填' }
              ]"
            >
              <base-input v-model="form.bankNo" placeholder="请输入开户银行账号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              label="注册场所地址"
              prop="registerAddress"
              :rules="[
                { required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'), message: '注册场所地址必填' }
              ]"
            >
              <base-input v-model="form.registerAddress" placeholder="请输入注册场所地址" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              label="注册固定电话"
              prop="registerTel"
              :rules="[
                { required: form.invoiceType === enums.INVOICE_TYPE.getFieldByKey('SPECIAL_VAT_INVOICE'), message: '注册固定电话必填' }
              ]"
            >
              <base-input v-model="form.registerTel" placeholder="请输入注册固定电话" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="税率" prop="taxRate">
              <base-select v-model="form.taxRate" placeholder="请选择税率" disabled :options="dicts[constant.DICTS_TAX_RATE]" />
            </base-form-item>
          </base-col>

          <template v-if="form.invoiceMakeType === enums.INVOICE_TYPE.getFieldByKey('VAT_INVOICE')">
            <base-col :span="6">
              <base-form-item label="是否提前开票" prop="beforeFlag">
                <base-select
                  v-model="form.beforeFlag"
                  placeholder="请选择是否提前开票"
                  :clearable="false"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                  @change="handleBeforeFlagChange"
                />
              </base-form-item>
            </base-col>

            <base-col v-if="form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="6">
              <base-form-item label="提前开票汇率" prop="rate">
                <base-input-number v-model="form.rate" :precision="6" placeholder="请输入提前开票汇率" @blur="handleBeforeFlagBlur" />
              </base-form-item>
            </base-col>
          </template>

          <base-col v-if="type === enums.FORM_TYPE.getFieldByKey('ADDED')" :span="6">
            <base-form-item label="价税合计" prop="allMoney">
              <base-input-number v-model="form.allMoney" disabled :precision="2" />
            </base-form-item>
          </base-col>

          <base-col v-if="form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')" :span="6">
            <base-form-item label="票差金额" prop="diffMoney">
              <base-input-number v-model="form.diffMoney" disabled :precision="2" />
            </base-form-item>
          </base-col>

          <base-col :span="12">
            <base-form-item label="发票备注" prop="remark" class="form-item-textarea">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入发票备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>
      <!-- 明细数据 -->
      <div class="common-form-block">
        <el-tabs v-model="activeName" type="card" class="common-compact-tabs">
          <el-tab-pane
            v-if="
              form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') &&
              form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('NO')
            "
            key="开票订单"
            label="开票订单"
            name="开票订单"
          >
            <base-edit-table
              ref="editTableARef"
              :show-added="false"
              height="300px"
              :name="constant.TABLE_NAME_SALES_TICKET_INVOICE_ENTER"
              @delete="cumulaAllMoneyByDetails"
            >
              <template v-slot:buttons="{ selectRecords }">
                <el-button size="mini" type="primary" :disabled="false" @click="handleCreateA(selectRecords)">生成</el-button>
              </template>
            </base-edit-table>
          </el-tab-pane>

          <el-tab-pane
            v-if="
              form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT') &&
              form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('YES')
            "
            key="开票商品明细"
            label="开票商品明细"
            name="开票商品明细"
          >
            <base-edit-table
              ref="editTableBRef"
              :show-added="false"
              height="300px"
              :name="constant.TABLE_NAME_SALES_TICKET_GOODS_ENTER"
              @delete="cumulaAllMoneyByDetails"
            >
              <template v-slot:buttons="{ selectRecords }">
                <el-button size="mini" type="primary" :disabled="false" @click="handleCreateB(selectRecords)">生成</el-button>
              </template>
            </base-edit-table>
          </el-tab-pane>

          <el-tab-pane key="服务费项目" label="服务费项目" name="服务费项目">
            <base-edit-table
              ref="editTableCRef"
              :show-added="false"
              height="300px"
              :name="constant.TABLE_NAME_SALES_TICKET_SERVICE_ENTER"
              @delete="cumulaAllMoneyByDetails"
            >
              <template v-slot:buttons="{ selectRecords }">
                <el-button size="mini" type="primary" :disabled="false" @click="handleCreateC(selectRecords)">生成</el-button>
              </template>
            </base-edit-table>
          </el-tab-pane>

          <el-tab-pane
            v-if="form.invoiceMakeType === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')"
            key="关联票差"
            label="关联票差"
            name="关联票差"
          >
            <base-edit-table
              ref="editTableDRef"
              :show-added="false"
              height="300px"
              :name="constant.TABLE_NAME_SALES_TICKET_DIFF_VOT_ENTER"
              @delete="cumulaAllDiffMoneyByDetails"
            >
              <template v-slot:buttons="{ selectRecords }">
                <el-button size="mini" type="primary" :disabled="false" @click="handleCreateD(selectRecords)">生成</el-button>
              </template>
            </base-edit-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </base-form>
    <details-create-a
      v-model="detailsCreateA.visible"
      :params="detailsCreateA.params"
      :parent-details-table-instance="getTableAInstance"
      @save="handleCreateASave"
    ></details-create-a>
    <details-create-b
      v-model="detailsCreateB.visible"
      :params="detailsCreateB.params"
      :parent-details-table-instance="getTableBInstance"
      @save="handleCreateBSave"
    ></details-create-b>
    <details-create-c
      v-model="detailsCreateC.visible"
      :params="detailsCreateC.params"
      :parent-details-table-instance="getTableCInstance"
      @save="handleCreateCSave"
    ></details-create-c>
    <details-create-d
      v-model="detailsCreateD.visible"
      :params="detailsCreateD.params"
      :parent-details-table-instance="getTableDInstance"
      @save="handleCreateDSave"
    ></details-create-d>
  </base-dialog>
</template>

<style lang="scss">
.sales-ticket-dialog {
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

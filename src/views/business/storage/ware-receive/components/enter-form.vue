<script>
import { getWareReceivingById, saveWareReceiving, updateWareReceiving } from '@/api/warehouse/ware-receiving'
import { getDataDictionary } from '@/api/admin/dicts'
import { getForReceivingOrderImportDetail } from '@/api/order/order-import-detail'
import { getForReceivingOrderExportDetail } from '@/api/order/order-export-detail'
import { getForReceivingOrderAgentPurchaseDetail } from '@/api/order/order-agent-purchase-detail'
import { getForReceivingOrderAgentFreightDetail } from '@/api/order/order-agent-freight-detail'
import { getForReceivingOrderAgentSaleDetail } from '@/api/order/order-agent-sale-detail'
import { getForReceivingOrderPurchaseDetail } from '@/api/order/order-purchase-detail'
import { getForReceivingOrderStorageDetail } from '@/api/order/order-storage-detail'
import { getOrderImportById } from '@/api/order/order-import'
import { getOrderExportById } from '@/api/order/order-export'
import { getOrderAgentPurchaseById } from '@/api/order/order-agent-purchase'
import { getOrderAgentSaleById } from '@/api/order/order-agent-sale'
import { getOrderPurchaseById } from '@/api/order/order-purchase'
import { getOrderAgentFreightById } from '@/api/order/order-agent-freight'
import { getOrderStorageById } from '@/api/order/order-storage'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import OrderSelectDetails from './order-select-details'
import EnterFormApportion from './enter-form-apportion'
import { clone } from 'xe-utils'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  auditStatus: void 0,
  customerId: 0,
  customerName: '',
  supplierId: 0,
  supplierName: '',
  orderId: 0,
  orderNo: '',
  warehouseId: 0,
  warehouseName: '',
  receivingDate: dayjs().format('YYYY-MM-DD'),
  orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT'),
  receivingType: '',
  expressName: '',
  expressNo: '',
  remark: ''
}

export default {
  name: 'EnterForm',
  components: { OrderSelectDetails, EnterFormApportion },
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
    },
    // ????????????????????????????????????????????????????????????
    jumpAddedObj: Object
  },
  data() {
    this.defaultConfig = {}
    return {
      enums,
      constant,
      // ----------- ???????????? -----------
      visible: this.value,
      // ----------- ???????????? -----------
      form: clone(form, true),
      rules: {
        orderNo: [{ required: true, message: '??????????????????' }],
        customerName: [{ required: true, message: '??????????????????' }],
        warehouseName: [{ required: true, message: '????????????' }],
        receivingType: [{ required: true, message: '??????????????????' }],
        receivingDate: [{ required: true, message: '??????????????????' }]
      },
      dicts: {},
      receivingTypeOptions: [],
      orderSelectDetailsForm: {
        visible: false,
        params: {}
      },
      apportion: {
        visible: false,
        rows: []
      }
    }
  },
  computed: {
    orderModuleName() {
      let moduleName = ''
      switch (this.form.orderType) {
        case enums.ORDER_TYPE.getFieldByKey('IMPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_IMPORT_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('EXPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_EXPORT_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_PURCHASE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_SALE'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_SALE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('PURCHASE'):
          moduleName = constant.AUTOCOMPLETE_KEY_PURCHASE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('STORAGE'):
          moduleName = constant.AUTOCOMPLETE_KEY_STORAGE_ORDER
          break
        case enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT'):
          moduleName = constant.AUTOCOMPLETE_KEY_AGENT_FREIGHT_ORDER
          break
      }
      return moduleName
    }
  },
  watch: {
    // ----------- ???????????? -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.getFormData()
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- ???????????? -----------
  },
  methods: {
    getFormData() {
      this.$nextTick(() => {
        this.form = clone(form, true)
        this.getFormInstance().resetFields()
        const type = this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')
        const { DICTS_RECEIVE_ORDER_TYPE, DICTS_RECEIVE_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_RECEIVE_ORDER_TYPE, DICTS_RECEIVE_TYPE]),
          type && getWareReceivingById(this.tableRow.id),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_DEFAULT_WAREHOUSE),
          this.getDetailsEditTableInstance().loadColumns(this.handleDetailsColumns()),
          this.jumpAddedObj && this.handleAddedJumpAssign(this.jumpAddedObj)
        ]).then(([dicts, info, defaultConfigRes]) => {
          this.dicts = dicts

          this.defaultConfig = defaultConfigRes.data

          // ?????????????????????
          const { warehouseId, warehouseName } = this.getOrderTypeDefaultWarehouse(
            this.form.orderType,
            enums.TRADE_MODE.getFieldByKey('IMPORT_AGENT'),
            this.defaultConfig
          )
          this.form.warehouseId = warehouseId
          this.form.warehouseName = warehouseName

          if (type) {
            Object.assign(this.form, info.data)
            this.getDetailsEditTableInstance().loadData(this.form.wareReceivingDetailVOList, 'cover')
          }

          this.receivingTypeOptions = this.rceivingTypesByAuditStatusOptions(this.dicts[DICTS_RECEIVE_TYPE])
        })
      })
    },
    /** ??????????????? */
    handleDetailsColumns() {
      const validProductModelAndProductName = ({ row }) => {
        if (!row.productName && !row.productModel) {
          return new Error('?????????????????????????????????')
        }
      }
      return [
        { field: 'partNo', width: 120, title: '??????', type: 'input' },
        {
          field: 'productName',
          title: '??????',
          width: 120,
          type: 'custom',
          rules: [{ validator: validProductModelAndProductName }],
          customRender: (h, { row, column }) => {
            return (
              <business-autocomplete-product
                vModel={row[column.field]}
                size="mini"
                value-key="productName"
                label="??????"
                placeholder="???????????????"
                onSelect={rows => this.handleProductNameSelect(rows, row)}
                onClear={() => this.handleProductNameClear(row)}
              />
            )
          }
        },
        {
          field: 'productModel',
          title: '??????',
          width: 180,
          type: 'custom',
          rules: [{ validator: validProductModelAndProductName }],
          customRender: (h, { row, column }) => {
            return (
              <business-autocomplete-basic
                vModel={row[column.field]}
                size="mini"
                triggerOnFocus={false}
                isExist={false}
                module-name={constant.AUTOCOMPLETE_KEY_PRODUCT_MODEL}
                label="??????"
                placeholder="???????????????"
                onSelect={rows => this.handleProductModelSelect(rows, row)}
              />
            )
          }
        },
        { field: 'productBrand', width: 120, title: '??????', type: 'input' },
        {
          field: 'productOrigin',
          title: '??????',
          width: 180,
          type: 'custom',
          customRender: (h, { row, column }) => {
            return (
              <business-autocomplete-ccl
                vModel={row[column.field]}
                size="mini"
                module-name={constant.AUTOCOMPLETE_KEY_CCL_COUNTRY}
                label="??????"
                placeholder="???????????????"
              />
            )
          }
        },
        {
          field: 'productUnit',
          title: '??????',
          width: 150,
          type: 'custom',
          customRender: (h, { row, column }) => {
            return (
              <business-autocomplete-basic
                vModel={row[column.field]}
                size="mini"
                module-name={constant.AUTOCOMPLETE_KEY_PRODUCT_UNIT}
                label="??????"
                placeholder="???????????????"
              />
            )
          }
        },
        {
          field: 'qty',
          width: 100,
          title: '??????',
          type: 'inputNumber',
          rules: [{ required: true, message: '????????????' }],
          sum: true,
          attrs: {
            precision: 6
          }
        },
        {
          field: 'netWeight',
          width: 100,
          title: '??????',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        {
          field: 'grossWeight',
          width: 100,
          title: '??????',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        { field: 'volume', width: 100, title: '??????', type: 'input' },
        {
          field: 'packages',
          width: 100,
          title: '??????',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        { field: 'lotNo', width: 100, title: '??????', type: 'input' },
        { field: 'dateCode', width: 100, title: '????????????', type: 'input' },
        { field: 'ctnsNo', width: 100, title: '??????', type: 'input' },
        { field: 'location', width: 100, title: '??????', type: 'input' },
        { field: 'remark', width: 100, title: '??????', type: 'input' }
      ]
    },
    rceivingTypesByAuditStatusOptions(receivingTypes) {
      const arr = [enums.RECEIVING_TYPE.getFieldByKey('CUSTOMS'), enums.RECEIVING_TYPE.getFieldByKey('ALLOCATE')]
      return this.form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')
        ? receivingTypes.filter(v => !arr.includes(v.value))
        : receivingTypes
    },
    // ????????????tab???????????????????????????????????????????????????????????????
    async handleAddedJumpAssign(obj) {
      const { orderId, orderType } = obj
      this.form.orderType = orderType
      const [res1, res2] = await Promise.all([this.getOrderTypeCorresOrder(orderId), this.getOrderTypeCorresDetailForReceive(orderId)])
      if (res1.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        const { id: orderId, orderNo, customerId, customerName, supplierId, supplierName, orderDeliveryTakeVOList } = res1.data
        // ??????????????????
        const orderDeliveryTakeVO = {}
        if (orderDeliveryTakeVOList) {
          // ??????????????????
          const { deliveryType, warehouseId, warehouseName, expressName, expressNo, remark } = orderDeliveryTakeVOList[0]
          orderDeliveryTakeVO.warehouseId = warehouseId || 0
          orderDeliveryTakeVO.warehouseName = warehouseName || ''
          Object.assign(orderDeliveryTakeVO, { receivingType: deliveryType, warehouseId, warehouseName, expressName, expressNo, remark })
        }
        Object.assign(
          this.form,
          { orderId, orderNo, customerId: customerId || 0, customerName, supplierId: supplierId || 0, supplierName },
          orderDeliveryTakeVO
        )
      }
      // ???????????????????????????????????????????????????
      if (res2.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        const orderDetailVOList = res2.data
        this.setGeneratedToGridAssign(orderDetailVOList)
      }
    },
    // ???????????????????????????????????????
    async getOrderTypeCorresOrder(orderId) {
      let result = null
      /* ???????????? */
      if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        result = await getOrderImportById(orderId)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        result = await getOrderExportById(orderId)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
        result = await getOrderAgentPurchaseById(orderId)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_SALE')) {
        result = await getOrderAgentSaleById(orderId)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('PURCHASE')) {
        result = await getOrderPurchaseById(orderId)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = await getOrderStorageById(orderId)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = await getOrderAgentFreightById(orderId)
      }

      return result
    },
    // ?????????????????????????????????????????????
    async getOrderTypeCorresDetailForReceive(orderId, receive = {}) {
      let result = {}
      /* ???????????? */
      if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        result = await getForReceivingOrderImportDetail(Object.assign({ orderId }, receive))
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        result = await getForReceivingOrderExportDetail(Object.assign({ orderId }, receive))
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
        result = await getForReceivingOrderAgentPurchaseDetail(Object.assign({ orderId }, receive))
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_SALE')) {
        result = await getForReceivingOrderAgentSaleDetail(Object.assign({ orderId }, receive))
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('PURCHASE')) {
        result = await getForReceivingOrderPurchaseDetail(Object.assign({ orderId }, receive))
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = await getForReceivingOrderStorageDetail(Object.assign({ orderId }, receive))
        // /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = await getForReceivingOrderAgentFreightDetail(Object.assign({ orderId }, receive))
      }

      return result
    },
    // ????????????????????????????????????????????????
    getOrderTypeDefaultWarehouse(orderType, tradeMode, templateEnums) {
      const {
        warehouseImportRkId,
        warehouseImportRkName,
        warehouseExportRkId,
        warehouseExportRkName,
        warehouseDomesticId,
        warehouseDomesticName
      } = templateEnums
      let warehouseId = 0
      let warehouseName = ''
      // ????????????
      if (orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        warehouseId = warehouseImportRkId
        warehouseName = warehouseImportRkName
        // ????????????
      } else if (orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        warehouseId = warehouseExportRkId
        warehouseName = warehouseExportRkName
        // TODO ???????????????????????????????????????????????????, ???????????????????????????????????????, ?????????????????????
      } else {
        // ??????????????????????????????????????????????????????????????????
        if (
          [enums.TRADE_MODE.getFieldByKey('PURCHASE_AGENT'), enums.TRADE_MODE.getFieldByKey('SALES_AGENT')].includes(tradeMode) ||
          !tradeMode
        ) {
          warehouseId = warehouseDomesticId
          warehouseName = warehouseDomesticName
        }
      }

      return {
        warehouseId,
        warehouseName
      }
    },
    handleOrderTypeChange(value) {
      // ??????????????????
      if (value === 0 || value) {
        this.$nextTick(async () => {
          await this.getDetailsEditTableInstance().loadData([], 'cover')
        })

        const { warehouseId: defaultWarehouseId, warehouseName: defaultWarehouseName } = this.getOrderTypeDefaultWarehouse(
          this.form.orderType,
          undefined,
          this.defaultConfig
        )

        const warehouseObj = {}
        if (
          this.form.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT') ||
          this.form.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')
        ) {
          warehouseObj.warehouseId = defaultWarehouseId
          warehouseObj.warehouseName = defaultWarehouseName
        }

        /* form???????????????????????????????????????????????????id */
        this.form = Object.assign(clone(form, true), Object.assign({ orderType: value || null }, warehouseObj))
        this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && (this.form.id = this.tableRow.id)
      }
    },
    async handleOrderNoSelect(rows) {
      const { id: orderId, orderNo, customerId, customerName, supplierId, supplierName } = rows[0]
      this.form.orderNo = orderNo
      this.form.orderId = orderId
      const orderDeliveryTakeVO = {}

      const result = await this.getOrderTypeCorresOrder(orderId)

      if (result.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        if (result.data && result.data.orderDeliveryTakeVOList && result.data.orderDeliveryTakeVOList.length > 0) {
          const { warehouseId, warehouseName, deliveryType: receivingType, expressName, expressNo } = result.data.orderDeliveryTakeVOList[0]
          Object.assign(orderDeliveryTakeVO, {
            warehouseId: warehouseId || 0,
            warehouseName: warehouseName || '',
            receivingType,
            expressName,
            expressNo
          })
        }
      }

      // ?????????????????????????????????, customerId???undefined???????????????0
      Object.assign(
        this.form,
        { customerId: customerId || 0, customerName, supplierId: supplierId || 0, supplierName },
        orderDeliveryTakeVO
      )
    },
    handleOrderNoClear() {
      this.form = Object.assign(clone(form, true), { orderType: this.form.orderType, orderId: 0 })
    },
    handleReceivingTypeChange() {
      this.form.expressNo = ''
    },
    handleProductNameSelect(rows, row) {
      const { id: productId, productName, productModel, productBrand, productOrigin, productUnit } = rows[0]
      Object.assign(row, {
        productId,
        productName,
        productModel,
        productBrand,
        productOrigin,
        productUnit
      })
    },
    handleProductNameClear(row) {
      row.productId = 0
      row.productName = ''
    },
    handleProductModelSelect(rows, row) {
      const { productName, productModel, productBrand, productOrigin, productUnit } = rows[0]

      Object.assign(row, {
        productName,
        productModel,
        productBrand,
        productOrigin,
        productUnit
      })
    },
    async handleCreate() {
      if (this.form.orderNo === '') return this.$message.warning('????????????????????????')
      if (this.form.orderId === 0) return this.$message.warning('?????????????????????????????????')

      Object.assign(this.orderSelectDetailsForm.params, {
        orderId: this.form.orderId
      })
      this.orderSelectDetailsForm.visible = true
    },
    async handleOrderSelectDetailSave(selectRecords, done) {
      await this.setGeneratedToGridAssign(selectRecords)
      done()
      this.orderSelectDetailsForm.visible = false
    },
    async setGeneratedToGridAssign(orderDetailVOList) {
      if (orderDetailVOList && orderDetailVOList.length > 0) {
        this.getDetailsEditTableInstance().clearSelectRows()
        const arr = []
        const selectArr = []
        // ???????????????????????????????????????????????????
        const selecteds = this.getDetailsEditTableInstance().getCheckboxRecords()
        const createds = this.getDetailsEditTableInstance().getRecords()
        for (let i = 0; i < orderDetailVOList.length; i++) {
          const obj = {}
          const {
            id,
            orderDetailId,
            orderNo,
            orderId,
            productId,
            productName,
            productBrand,
            productModel,
            productOrigin,
            productUnit,
            qty,
            receivingQty,
            dateCode,
            partNo,
            netWeight,
            grossWeight,
            lotNo,
            packages,
            remark
          } = orderDetailVOList[i]

          const row = Object.assign(obj, {
            orderNo,
            orderId,
            orderDetailId: orderDetailId || id,
            productId,
            productName,
            productBrand,
            productModel,
            productOrigin,
            partNo,
            dateCode,
            lotNo,
            productUnit,
            netWeight,
            grossWeight,
            packages,
            qty: new BigNumber(qty).minus(receivingQty).toNumber(),
            remark
          })

          const target = createds.find(v => v.orderDetailId === row.orderDetailId)

          if (!target) {
            arr.push(row)
          }
        }
        const results = [...createds, ...arr]

        const loadDataeds = await this.getDetailsEditTableInstance().loadData(results, 'cover')
        selecteds.forEach(v => {
          const target = loadDataeds.find(vv => v.orderDetailId === vv.orderDetailId)
          if (target) {
            selectArr.push(target)
          }
        })
        this.$nextTick(() => {
          this.getDetailsEditTableInstance().setCheckboxRow(selectArr, true)
        })
      }
    },
    async handleSplit(rows) {
      const records = this.getDetailsEditTableInstance().getRecords()
      const currentIndex = records.findIndex(record => record.__XID === rows[0].__XID)
      // ?????????????????????????????????????????????????????????__XID,????????????
      delete rows[0].__XID
      // ?????????????????????
      if (currentIndex === records.length - 1) {
        await this.getDetailsEditTableInstance().loadData(rows[0], 'insert', -1)
      } else {
        await this.getDetailsEditTableInstance().loadData(rows[0], 'insert', records[currentIndex + 1])
      }
    },
    // ???????????????
    handleApportion(rows) {
      this.apportion = {
        visible: true,
        rows
      }
    },
    // ?????????????????????
    handleApportionSave(form, done) {
      let netWeightNum = 0
      let grossWeightNum = 0
      let netWeightSum = 0
      // ???????????????
      const sum = this.apportion.rows.reduce((total, row) => {
        return new BigNumber(total).plus(row.qty).toNumber()
      }, 0)

      // ???????????????
      if (form.grossWeightRule === enums.GROSS_WEIGHT_RULE.getFieldByKey('GROSS_WEIGHT')) {
        netWeightSum = this.apportion.rows.reduce((total, row) => {
          return new BigNumber(total).plus(row.netWeight).toNumber()
        }, 0)
      }

      this.apportion.rows.forEach(row => {
        if (form.netWeight !== 0) {
          const netWeightAppor = new BigNumber(row.qty).div(sum).times(form.netWeight).dp(2).toNumber()
          netWeightNum = netWeightAppor + netWeightNum
          row.netWeight = netWeightAppor
        }

        if (form.grossWeight !== 0) {
          if (form.grossWeightRule === enums.GROSS_WEIGHT_RULE.getFieldByKey('GROSS_WEIGHT')) {
            const grossWeightAppor = new BigNumber(row.netWeight).div(netWeightSum).times(form.grossWeight).dp(2).toNumber()
            grossWeightNum = grossWeightAppor + grossWeightNum
            row.grossWeight = grossWeightAppor
          } else {
            const grossWeightAppor = new BigNumber(row.qty).div(sum).times(form.grossWeight).dp(2).toNumber()
            grossWeightNum = grossWeightAppor + grossWeightNum
            row.grossWeight = grossWeightAppor
          }
        }
      })

      // ???????????????????????????????????????????????????
      if (form.netWeight !== 0) {
        const netWeightRemainder = new BigNumber(form.netWeight).minus(netWeightNum).toNumber()
        if (netWeightRemainder > 0) {
          this.apportion.rows[0].netWeight = new BigNumber(this.apportion.rows[0].netWeight).plus(netWeightRemainder).toNumber()
        }
      }

      if (form.grossWeight !== 0) {
        const grossWeightRemainder = new BigNumber(form.grossWeight).minus(grossWeightNum).toNumber()
        if (grossWeightRemainder > 0) {
          this.apportion.rows[0].grossWeight = new BigNumber(this.apportion.rows[0].grossWeight).plus(grossWeightRemainder).toNumber()
        }
      }

      done()
      this.$message.success('????????????')
      this.apportion.visible = false
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`????????????: ???${rowIndex}??? ${rule.message}`)
            }
            const wareReceivingDetailDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign({ wareReceivingDetailDTOList }, this.form)
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveWareReceiving(formData)
                .then(() => {
                  this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}??????`)
                  this.visible = false
                  done()
                  this.reLoad(false)
                })
                .catch(() => {
                  done()
                })
            } else {
              updateWareReceiving(formData)
                .then(() => {
                  this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}??????`)
                  this.visible = false
                  done()
                  // ???????????????????????????????????????????????????
                  this.reLoad(true)
                })
                .catch(() => {
                  done()
                })
            }
          })
        } else {
          // ?????? el-message ???????????????????????????
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
    custom-class="common-form-dialog ware-receiving-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <!-- ???????????? -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          ????????????
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="????????????" prop="orderType">
              <base-select
                v-model="form.orderType"
                placeholder="?????????????????????"
                :options="dicts[constant.DICTS_RECEIVE_ORDER_TYPE]"
                @change="handleOrderTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="????????????" prop="orderNo">
              <business-autocomplete-basic
                v-model="form.orderNo"
                label="????????????"
                placeholder="?????????????????????"
                :params="{
                  auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS'),
                  receivingStatus: [
                    enums.RECEIVING_STATUS.getFieldByKey('WAIT'),
                    enums.RECEIVING_STATUS.getFieldByKey('PART'),
                    enums.RECEIVING_STATUS.getFieldByKey('ERROR')
                  ].join(',')
                }"
                :module-name="orderModuleName"
                @select="handleOrderNoSelect"
                @clear="handleOrderNoClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="????????????" prop="customerName">
              <business-autocomplete-basic
                v-model="form.customerName"
                label="????????????"
                placeholder="?????????????????????"
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
            <base-form-item label="???????????????" prop="supplierName">
              <business-autocomplete-basic
                v-model="form.supplierName"
                label="???????????????"
                placeholder="????????????????????????"
                :module-name="constant.AUTOCOMPLETE_KEY_SUPPLIER"
                :auto-assign="{
                  supplierId: 'id'
                }"
                :form="form"
                @clear="() => (form.supplierId = 0)"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="??????" prop="warehouseName">
              <business-autocomplete-warehouse
                v-model="form.warehouseName"
                value-key="warehouseName"
                label="??????"
                placeholder="???????????????"
                :auto-assign="{
                  warehouseId: 'id'
                }"
                :form="form"
                @clear="() => (form.warehouseId = 0)"
              ></business-autocomplete-warehouse>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="????????????" prop="receivingDate">
              <base-date-picker v-model="form.receivingDate" placeholder="??????????????????" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="????????????" prop="receivingType">
              <base-select
                v-model="form.receivingType"
                placeholder="?????????????????????"
                :options="receivingTypeOptions"
                @change="handleReceivingTypeChange"
              />
            </base-form-item>
          </base-col>

          <template v-if="form.receivingType === enums.RECEIVING_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
            <base-col :span="6">
              <base-form-item label="???????????????" prop="expressName">
                <base-input v-model="form.expressName" placeholder="????????????????????????" />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="????????????" prop="expressNo">
                <base-input v-model="form.expressNo" placeholder="?????????????????????" />
              </base-form-item>
            </base-col>
          </template>

          <base-col :span="12">
            <base-form-item label="??????" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="???????????????" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- ???????????? -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          ????????????
        </span>
        <base-edit-table
          ref="detailsEditTableRef"
          show-sort
          height="300px"
          :show-added="false"
          :name="constant.TABLE_NAME_WARE_RECEIVING_ENTER"
        >
          <template v-slot:buttons="{ selectRecords }">
            <el-button size="mini" type="primary" @click="handleCreate(selectRecords)">??????</el-button>
            <el-button
              size="mini"
              type="primary"
              :disabled="!selectRecords.length || selectRecords.length > 1"
              @click="handleSplit(selectRecords)"
              >??????</el-button
            >
            <el-button
              v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')"
              size="mini"
              type="warning"
              :disabled="!(selectRecords.length > 1)"
              @click="handleApportion(selectRecords)"
              >???????????????</el-button
            >
          </template>
        </base-edit-table>
      </div>
    </base-form>
    <order-select-details
      v-model="orderSelectDetailsForm.visible"
      :params="orderSelectDetailsForm.params"
      :order-type="form.orderType"
      :parent-details-table-instance="getDetailsEditTableInstance"
      @save="handleOrderSelectDetailSave"
    />
    <enter-form-apportion v-model="apportion.visible" @save="handleApportionSave" />
  </base-dialog>
</template>

<style lang="scss">
.ware-receiving-dialog {
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

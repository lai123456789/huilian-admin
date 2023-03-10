<script>
import { getWareShippingById, saveWareShipping, updateWareShipping } from '@/api/warehouse/ware-shipping'
import { getDataDictionary } from '@/api/admin/dicts'
import { getForShippingOrderImportDetail } from '@/api/order/order-import-detail'
import { getForShippingOrderExportDetail } from '@/api/order/order-export-detail'
import { getForShippingOrderAgentPurchaseDetail } from '@/api/order/order-agent-purchase-detail'
import { getForShippingOrderSaleDetail } from '@/api/order/order-sale-detail'
import { getForShippingOrderAgentFreightDetail } from '@/api/order/order-agent-freight-detail'
import { getForShippingOrderStorageDetail } from '@/api/order/order-storage-detail'
import { getOrderImportById } from '@/api/order/order-import'
import { getOrderExportById } from '@/api/order/order-export'
import { getOrderAgentPurchaseById } from '@/api/order/order-agent-purchase'
import { getOrderSaleById } from '@/api/order/order-sale'
import { getOrderAgentFreightById } from '@/api/order/order-agent-freight'
import { getOrderStorageById } from '@/api/order/order-storage'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import OrderSelectDetails from './order-select-details'
import { clone } from 'xe-utils'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  auditStatus: void 0,
  customerId: 0,
  customerName: '',
  orderId: 0,
  orderNo: '',
  warehouseId: 0,
  warehouseName: '',
  shippingDate: dayjs().format('YYYY-MM-DD'),
  orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT'),
  shippingType: '',
  deliveryAddress: '',
  deliveryCompany: '',
  deliveryIdCard: '',
  deliveryMobile: '',
  deliveryPerson: '',
  expressName: '',
  expressNo: '',
  transferFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
  endWarehouseName: '',
  endWarehouseId: 0,
  isBuyEx: enums.WHETHER_STATUS.getFieldByKey('NO'),
  remark: ''
}

export default {
  name: 'EnterForm',
  components: { OrderSelectDetails },
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
        customerName: [{ required: true, message: '??????????????????' }],
        warehouseName: [{ required: true, message: '????????????' }],
        shippingType: [{ required: true, message: '??????????????????' }],
        shippingDate: [{ required: true, message: '??????????????????' }]
      },
      dicts: {},
      shippingTypeOptions: [],
      orderSelectDetailsForm: {
        visible: false,
        params: {}
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
        case enums.ORDER_TYPE.getFieldByKey('SALE'):
          moduleName = constant.AUTOCOMPLETE_KEY_SALE_ORDER
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
        this.operateTake = true
        this.getFormInstance().resetFields()
        const type = this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')
        const { DICTS_SHIPPING_ORDER_TYPE, DICTS_SHIPPING_TYPE, DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_SHIPPING_ORDER_TYPE, DICTS_SHIPPING_TYPE, DICTS_WHETHER_STATUS]),
          type && getWareShippingById(this.tableRow.id),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_DEFAULT_WAREHOUSE),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_SHIPPING_DEFAULT),
          this.getDetailsEditTableInstance().loadColumns(this.handleDetailsColumns()[0])
        ]).then(([dicts, info, defaultWarehouseConfigRes, defaultShippingConfigRes]) => {
          this.dicts = dicts

          this.defaultConfig = {
            defaultWarehouse: defaultWarehouseConfigRes.data,
            shippingDefault: defaultShippingConfigRes.data
          }

          if (this.jumpAddedObj) {
            this.handleAddedJumpAssign(this.jumpAddedObj)
          } else {
            if (Object.keys(this.defaultConfig.shippingDefault).length) {
              this.form.orderType = this.defaultConfig.shippingDefault.orderType
              const target = this.getDefaultConfigByOrderType(this.form.orderType, this.defaultConfig.shippingDefault.configByOrderTypes)
              this.form.isBuyEx = target ? target.isBuyEx : enums.WHETHER_STATUS.getFieldByKey('NO')
            }

            // ?????????????????????
            const { warehouseId, warehouseName } = this.getOrderTypeDefaultWarehouse(
              this.form.orderType,
              enums.TRADE_MODE.getFieldByKey('IMPORT_AGENT'),
              this.defaultConfig.defaultWarehouse
            )
            this.form.warehouseId = warehouseId
            this.form.warehouseName = warehouseName
          }

          if (type) {
            Object.assign(this.form, info.data)
            this.getDetailsEditTableInstance().loadData(this.form.wareShippingDetailVOList, 'cover')
          }

          this.shippingTypeOptions = this.shippingTypesByAuditStatusOptions(this.dicts[DICTS_SHIPPING_TYPE])
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
        [
          { field: 'partNo', width: 120, title: '??????' },
          { field: 'orderNo', width: 160, title: '????????????' },
          { field: 'productName', width: 120, title: '??????' },
          { field: 'productModel', width: 180, title: '??????' },
          { field: 'productBrand', width: 120, title: '??????' },
          { field: 'productOrigin', width: 110, title: '??????' },
          { field: 'productUnit', width: 100, title: '??????' },
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
          { field: 'lotNo', width: 100, title: '??????' },
          { field: 'dateCode', width: 100, title: '????????????' },
          { field: 'remark', width: 120, title: '??????' }
        ],
        [
          { field: 'partNo', width: 120, title: '??????', type: 'input' },
          { field: 'orderNo', width: 160, title: '????????????' },
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
          { field: 'lotNo', width: 100, title: '??????', type: 'input' },
          { field: 'dateCode', width: 100, title: '????????????', type: 'input' },
          { field: 'remark', width: 100, title: '??????', type: 'input' }
        ]
      ]
    },
    shippingTypesByAuditStatusOptions(shippingTypes) {
      const arr = [
        enums.SHIPPING_TYPE.getFieldByKey('SUPPLIER_DELIVERY'),
        enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY'),
        enums.SHIPPING_TYPE.getFieldByKey('EXPRESS_DELIVERY')
      ]
      return this.form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')
        ? shippingTypes.filter(v => arr.includes(v.value))
        : shippingTypes
    },
    // ????????????tab???????????????????????????????????????????????????????????????
    async handleAddedJumpAssign(obj) {
      const { orderId, orderType, tradeMode, customerId } = obj
      this.form.orderType = orderType
      // ???????????????
      const { warehouseId, warehouseName } = this.getOrderTypeDefaultWarehouse(
        this.form.orderType,
        tradeMode,
        this.defaultConfig.defaultWarehouse
      )
      const [res1, res2] = await Promise.all([
        this.getOrderTypeCorresOrder(orderId),
        this.getOrderTypeCorresDetailForReceive(orderId, customerId)
      ])
      if (res1.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        const { id: orderId, orderNo, customerId, customerName, orderDeliverySendVOList } = res1.data
        // ??????????????????
        const orderDeliverySendVO = {}
        if (orderDeliverySendVOList) {
          // ??????????????????
          const { deliveryType, deliveryAddress, deliveryCompany, deliveryMobile, deliveryPerson, deliveryIdCard, expressName } =
            orderDeliverySendVOList[0]
          Object.assign(orderDeliverySendVO, {
            shippingType: deliveryType,
            deliveryAddress,
            deliveryCompany,
            deliveryMobile,
            deliveryPerson,
            deliveryIdCard,
            expressName
          })
        }
        Object.assign(
          this.form,
          { orderId, orderNo, warehouseId, warehouseName, customerId, customerName, isBuyEx: enums.WHETHER_STATUS.getFieldByKey('NO') },
          orderDeliverySendVO
        )
      }
      // ???????????????????????????????????????????????????
      if (res2.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        const orderDetailVOList = res2.data.records || []
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
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('SALE')) {
        result = await getOrderSaleById(orderId)
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
    async getOrderTypeCorresDetailForReceive(orderId, customerId) {
      const params = { orderId, customerId, current: 1, size: 100 }
      let result = {}
      /* ???????????? */
      if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        result = await getForShippingOrderImportDetail(params)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        result = await getForShippingOrderExportDetail(params)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
        result = await getForShippingOrderAgentPurchaseDetail(params)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('SALE')) {
        result = await getForShippingOrderSaleDetail(params)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = await getForShippingOrderStorageDetail(params)
        /* ???????????? */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = await getForShippingOrderAgentFreightDetail(params)
      }
      return result
    },
    // ????????????????????????????????????????????????
    getOrderTypeDefaultWarehouse(orderType, tradeMode, templateEnums) {
      const {
        warehouseImportCkId,
        warehouseImportCkName,
        warehouseExportCkId,
        warehouseExportCkName,
        warehouseDomesticId,
        warehouseDomesticName
      } = templateEnums
      let warehouseId = 0
      let warehouseName = ''
      // ????????????
      if (orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        warehouseId = warehouseImportCkId
        warehouseName = warehouseImportCkName
        // ????????????
      } else if (orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        warehouseId = warehouseExportCkId
        warehouseName = warehouseExportCkName
        // TODO ???????????????????????????????????????????????????, ???????????????????????????????????????, ?????????????????????
      } else {
        // ??????????????????????????????????????????????????????????????????
        if ([enums.TRADE_MODE.getFieldByKey('PURCHASE_AGENT')].includes(tradeMode) || !tradeMode) {
          warehouseId = warehouseDomesticId
          warehouseName = warehouseDomesticName
        }
      }

      return {
        warehouseId,
        warehouseName
      }
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
            shippingQty,
            dateCode,
            partNo,
            lotNo,
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
            qty: new BigNumber(qty).minus(shippingQty).toNumber(),
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
          const targer = loadDataeds.find(vv => v.orderDetailId === vv.orderDetailId)
          if (targer) {
            selectArr.push(targer)
          }
        })
        this.$nextTick(() => {
          this.getDetailsEditTableInstance().setCheckboxRow(selectArr, true)
        })
      }
    },
    // ?????????????????????????????????????????????
    getDefaultConfigByOrderType(orderType, configs) {
      const target = configs.find(v => v.orderTypeKey === orderType)
      return target ? target.form : false
    },
    handleOrderTypeChange(value) {
      // ??????????????????
      if (value === 0 || value) {
        const { warehouseId: defaultWarehouseId, warehouseName: defaultWarehouseName } = this.getOrderTypeDefaultWarehouse(
          this.form.orderType,
          undefined,
          this.defaultConfig.defaultWarehouse
        )

        let target = false
        if (Object.keys(this.defaultConfig.shippingDefault).length) {
          target = this.getDefaultConfigByOrderType(this.form.orderType, this.defaultConfig.shippingDefault.configByOrderTypes)
        }

        const warehouseObj = {}
        if (
          this.form.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT') ||
          this.form.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')
        ) {
          warehouseObj.warehouseId = defaultWarehouseId
          warehouseObj.warehouseName = defaultWarehouseName
        }

        this.form = Object.assign(
          clone(form, true),
          Object.assign(
            { orderType: value || null, isBuyEx: target ? target.isBuyEx : enums.WHETHER_STATUS.getFieldByKey('NO') },
            warehouseObj
          )
        )
        this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && (this.form.id = this.mainRow.id)

        this.$nextTick(() => {
          this.getDetailsEditTableInstance().loadColumns(
            // ??????????????????????????????????????????
            this.handleDetailsColumns()[
              [
                enums.ORDER_TYPE.getFieldByKey('IMPORT'),
                enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'),
                enums.ORDER_TYPE.getFieldByKey('SALE')
              ].indexOf(value) > -1
                ? 0
                : 1
            ]
          )
          /* form???????????????????????????????????????????????????id */
          this.getDetailsEditTableInstance().loadData([], 'cover')
        })
      }
    },
    handleIsBuyExChange() {
      Object.assign(this.form, {
        orderId: 0,
        orderNo: ''
      })
    },
    async handleOrderNoSelect(rows) {
      const orderDeliverySendVO = {}
      const { id: orderId, orderNo, customerId, customerName } = rows[0]
      Object.assign(this.form, { orderNo, orderId })

      const result = await this.getOrderTypeCorresOrder(orderId)

      if (result.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        if (result.data && result.data.orderDeliverySendVOList && result.data.orderDeliverySendVOList.length > 0) {
          const {
            deliveryType: shippingType,
            deliveryAddress,
            deliveryCompany,
            deliveryIdCard,
            deliveryMobile,
            deliveryPerson,
            expressName
          } = result.data.orderDeliverySendVOList[0]
          Object.assign(orderDeliverySendVO, {
            shippingType,
            deliveryAddress,
            deliveryCompany,
            deliveryIdCard,
            deliveryMobile,
            deliveryPerson,
            expressName
          })
        }
      }
      Object.assign(this.form, { customerId, customerName }, orderDeliverySendVO)
      await this.getDetailsEditTableInstance().loadData([], 'cover')
    },
    handleOrderNoClear() {
      const { warehouseId, warehouseName } = this.getOrderTypeDefaultWarehouse(
        this.form.orderType,
        enums.TRADE_MODE.getFieldByKey('IMPORT_AGENT'),
        this.defaultConfig.defaultWarehouse
      )
      this.form = Object.assign(clone(form, true), { orderType: this.form.orderType, warehouseId, warehouseName, orderId: 0 })
    },
    handleCustomerNameSelect(rows) {
      const { id, companyName } = rows[0]
      this.form.customerName = companyName
      this.form.customerId = id
      this.getDetailsEditTableInstance().loadData([], 'cover')
    },
    handleCustomerNameInput() {
      if (this.form.customerName === '') {
        this.getDetailsEditTableInstance().loadData([], 'cover')
      }
    },
    handleCustomerNameClear() {
      this.form.customerId = 0
      if (this.form.customerName === '') {
        this.getDetailsEditTableInstance().loadData([], 'cover')
      }
    },
    handleDeliveryCompanySelect(rows) {
      const { deliveryAddress, mobile: deliveryMobile, person: deliveryPerson } = rows[0]
      Object.assign(this.form, { deliveryAddress, deliveryMobile, deliveryPerson })
    },
    handleShippingTypeChange() {
      Object.assign(this.form, { deliveryAddress: '', deliveryCompany: '', deliveryMobile: '', deliveryPerson: '', deliveryIdCard: '' })
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
    handleCreate() {
      if (this.form.isBuyEx === enums.WHETHER_STATUS.getFieldByKey('NO') && this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
        if (this.form.orderNo === '') return this.$message.warning('????????????????????????')
      }
      if (this.form.customerName === '') return this.$message.warning('????????????????????????')

      // this.orderDetailData = this.getDetailsEditTableInstance().getRecords()

      Object.assign(
        this.orderSelectDetailsForm.params,
        {
          customerId: this.form.customerId,
          orderId: this.form.isBuyEx === enums.WHETHER_STATUS.getFieldByKey('NO') ? this.form.orderId : void 0
        },
        this.type !== enums.FORM_TYPE.getFieldByKey('ADDED') ? { shippingId: this.form.id } : {}
      )

      this.orderSelectDetailsForm.visible = true
    },
    async handleOrderSelectDetailSave(selectRecords, done) {
      await this.setGeneratedToGridAssign(selectRecords)
      done()
      this.orderSelectDetailsForm.visible = false
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
            const wareShippingDetailDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign({ wareShippingDetailDTOList }, this.form)
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveWareShipping(formData)
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
              updateWareShipping(formData)
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
    custom-class="common-form-dialog ware-shipping-dialog"
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
                :options="dicts[constant.DICTS_SHIPPING_ORDER_TYPE]"
                @change="handleOrderTypeChange"
              />
            </base-form-item>
          </base-col>
          <template v-if="type === enums.FORM_TYPE.getFieldByKey('ADDED')">
            <base-col :span="6">
              <base-form-item label="??????????????????" prop="isBuyEx">
                <base-select
                  v-model="form.isBuyEx"
                  placeholder="???????????????????????????"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                  @change="handleIsBuyExChange"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="????????????" prop="orderNo">
                <business-autocomplete-basic
                  v-model="form.orderNo"
                  label="????????????"
                  placeholder="?????????????????????"
                  :disabled="form.isBuyEx === enums.WHETHER_STATUS.getFieldByKey('YES')"
                  :params="{
                    auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS'),
                    shippingStatus: enums.WARE_SHIPPING_STATUS.getFieldByKey('WAIT')
                  }"
                  :module-name="orderModuleName"
                  @select="handleOrderNoSelect"
                  @clear="handleOrderNoClear"
                ></business-autocomplete-basic>
              </base-form-item>
            </base-col>
          </template>

          <base-col :span="6">
            <base-form-item label="????????????" prop="customerName">
              <business-autocomplete-basic
                v-model="form.customerName"
                label="????????????"
                placeholder="?????????????????????"
                :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                @select="handleCustomerNameSelect"
                @clear="handleCustomerNameClear"
                @input="handleCustomerNameInput"
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
            <base-form-item label="????????????" prop="shippingDate">
              <base-date-picker v-model="form.shippingDate" placeholder="??????????????????" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="????????????" prop="shippingType">
              <base-select
                v-model="form.shippingType"
                placeholder="?????????????????????"
                :options="shippingTypeOptions"
                @change="handleShippingTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="????????????" prop="deliveryCompany">
              <business-autocomplete-basic
                v-model="form.deliveryCompany"
                label="????????????"
                placeholder="?????????????????????"
                :module-name="constant.AUTOCOMPLETE_KEY_CUS_DELIVERY"
                value-key="deliveryCompany"
                :params="{
                  customerId: form.customerId
                }"
                :auto-assign="{
                  deliveryAddress: 'deliveryAddress',
                  deliveryMobile: 'mobile',
                  deliveryPerson: 'person'
                }"
                :form="form"
                @select="handleDeliveryCompanySelect"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col v-if="form.shippingType !== enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="6">
            <base-form-item label="????????????" prop="deliveryAddress">
              <base-input v-model="form.deliveryAddress" placeholder="?????????????????????" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              :label="`${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '??????' : '??????'}???`"
              prop="deliveryPerson"
            >
              <base-input
                v-model="form.deliveryPerson"
                :placeholder="`?????????${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '??????' : '??????'}???`"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              :label="`${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '??????' : '??????'}??????`"
              prop="deliveryMobile"
            >
              <base-input
                v-model="form.deliveryMobile"
                :placeholder="`?????????${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '??????' : '??????'}??????`"
              />
            </base-form-item>
          </base-col>

          <base-col v-if="form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="6">
            <base-form-item label="??????????????????" prop="deliveryIdCard">
              <base-input v-model="form.deliveryIdCard" placeholder="???????????????????????????" />
            </base-form-item>
          </base-col>

          <template v-if="form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
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
        <base-edit-table ref="detailsEditTableRef" height="300px" :show-added="false" :name="constant.TABLE_NAME_WARE_SHIPPING_ENTER">
          <template v-slot:buttons="{ selectRecords }">
            <el-button size="mini" type="primary" @click="handleCreate(selectRecords)">??????</el-button>
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
  </base-dialog>
</template>

<style lang="scss">
.ware-shipping-dialog {
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

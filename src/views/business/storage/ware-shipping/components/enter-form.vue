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
    // 存放订单关联下的出库单新增跳转所带的信息
    jumpAddedObj: Object
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
        customerName: [{ required: true, message: '客户名称必填' }],
        warehouseName: [{ required: true, message: '仓库必填' }],
        shippingType: [{ required: true, message: '出库方式必填' }],
        shippingDate: [{ required: true, message: '出库日期必填' }]
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

            // 默认是代理进口
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
    /** 明细列数据 */
    handleDetailsColumns() {
      const validProductModelAndProductName = ({ row }) => {
        if (!row.productName && !row.productModel) {
          return new Error('品名和型号必填其中一个')
        }
      }
      return [
        [
          { field: 'partNo', width: 120, title: '料号' },
          { field: 'orderNo', width: 160, title: '订单编号' },
          { field: 'productName', width: 120, title: '品名' },
          { field: 'productModel', width: 180, title: '型号' },
          { field: 'productBrand', width: 120, title: '品牌' },
          { field: 'productOrigin', width: 110, title: '产地' },
          { field: 'productUnit', width: 100, title: '单位' },
          {
            field: 'qty',
            width: 100,
            title: '数量',
            type: 'inputNumber',
            rules: [{ required: true, message: '数量必填' }],
            sum: true,
            attrs: {
              precision: 6
            }
          },
          { field: 'lotNo', width: 100, title: '批号' },
          { field: 'dateCode', width: 100, title: '生产日期' },
          { field: 'remark', width: 120, title: '备注' }
        ],
        [
          { field: 'partNo', width: 120, title: '料号', type: 'input' },
          { field: 'orderNo', width: 160, title: '订单编号' },
          {
            field: 'productName',
            title: '品名',
            width: 120,
            type: 'custom',
            rules: [{ validator: validProductModelAndProductName }],
            customRender: (h, { row, column }) => {
              return (
                <business-autocomplete-product
                  vModel={row[column.field]}
                  size="mini"
                  value-key="productName"
                  label="品名"
                  placeholder="请输入品名"
                  onSelect={rows => this.handleProductNameSelect(rows, row)}
                />
              )
            }
          },
          {
            field: 'productModel',
            title: '型号',
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
                  label="型号"
                  placeholder="请输入型号"
                  onSelect={rows => this.handleProductModelSelect(rows, row)}
                />
              )
            }
          },
          { field: 'productBrand', width: 120, title: '品牌', type: 'input' },
          {
            field: 'productOrigin',
            title: '产地',
            width: 180,
            type: 'custom',
            customRender: (h, { row, column }) => {
              return (
                <business-autocomplete-ccl
                  vModel={row[column.field]}
                  size="mini"
                  module-name={constant.AUTOCOMPLETE_KEY_CCL_COUNTRY}
                  label="产地"
                  placeholder="请输入产地"
                />
              )
            }
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
            field: 'qty',
            width: 100,
            title: '数量',
            type: 'inputNumber',
            rules: [{ required: true, message: '数量必填' }],
            sum: true,
            attrs: {
              precision: 6
            }
          },
          { field: 'lotNo', width: 100, title: '批号', type: 'input' },
          { field: 'dateCode', width: 100, title: '生产日期', type: 'input' },
          { field: 'remark', width: 100, title: '备注', type: 'input' }
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
    // 处理订单tab页下的出库单新增补全明细和订单带过来的信息
    async handleAddedJumpAssign(obj) {
      const { orderId, orderType, tradeMode, customerId } = obj
      this.form.orderType = orderType
      // 取默认仓库
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
        // 客户收货信息
        const orderDeliverySendVO = {}
        if (orderDeliverySendVOList) {
          // 默认取第一条
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
      // 把所有能查询的出库订单信息生成出来
      if (res2.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        const orderDetailVOList = res2.data.records || []
        this.setGeneratedToGridAssign(orderDetailVOList)
      }
    },
    // 获取不同订单类型下订单信息
    async getOrderTypeCorresOrder(orderId) {
      let result = null
      /* 进口订单 */
      if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        result = await getOrderImportById(orderId)
        /* 出口订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        result = await getOrderExportById(orderId)
        /* 代采订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
        result = await getOrderAgentPurchaseById(orderId)
        /* 销售订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('SALE')) {
        result = await getOrderSaleById(orderId)
        /* 仓储订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = await getOrderStorageById(orderId)
        /* 货代订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = await getOrderAgentFreightById(orderId)
      }
      return result
    },
    // 获取不同订单类型下订单出库信息
    async getOrderTypeCorresDetailForReceive(orderId, customerId) {
      const params = { orderId, customerId, current: 1, size: 100 }
      let result = {}
      /* 进口订单 */
      if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        result = await getForShippingOrderImportDetail(params)
        /* 出口订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        result = await getForShippingOrderExportDetail(params)
        /* 代采订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
        result = await getForShippingOrderAgentPurchaseDetail(params)
        /* 销售订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('SALE')) {
        result = await getForShippingOrderSaleDetail(params)
        /* 仓储订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = await getForShippingOrderStorageDetail(params)
        /* 货代订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = await getForShippingOrderAgentFreightDetail(params)
      }
      return result
    },
    // 根据不同的订单类型去取默认的仓库
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
      // 进口订单
      if (orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        warehouseId = warehouseImportCkId
        warehouseName = warehouseImportCkName
        // 出口订单
      } else if (orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        warehouseId = warehouseExportCkId
        warehouseName = warehouseExportCkName
        // TODO 剩下的订单类型默认都取的是境内仓库, 后面可能会有境外仓库的可能, 到时再进行判断
      } else {
        // 境内贸易模式和没有的贸易模式的默认取境内仓库
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
        // 保存选中的数据跟已生成的数据做对比
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
    // 根据不同的订单类型去取默认配置
    getDefaultConfigByOrderType(orderType, configs) {
      const target = configs.find(v => v.orderTypeKey === orderType)
      return target ? target.form : false
    },
    handleOrderTypeChange(value) {
      // 空字符串除外
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
            // 根据订单类型取对应下标列数据
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
          /* form初始完，记得在修改状态时多赋值一个id */
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
        if (this.form.orderNo === '') return this.$message.warning('请先选择订单编号')
      }
      if (this.form.customerName === '') return this.$message.warning('请先选择客户名称')

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
              return this.$message.error(`出库明细: 第${rowIndex}行 ${rule.message}`)
            }
            const wareShippingDetailDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign({ wareShippingDetailDTOList }, this.form)
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveWareShipping(formData)
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
              updateWareShipping(formData)
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
                :options="dicts[constant.DICTS_SHIPPING_ORDER_TYPE]"
                @change="handleOrderTypeChange"
              />
            </base-form-item>
          </base-col>
          <template v-if="type === enums.FORM_TYPE.getFieldByKey('ADDED')">
            <base-col :span="6">
              <base-form-item label="是否多单出库" prop="isBuyEx">
                <base-select
                  v-model="form.isBuyEx"
                  placeholder="请选择是否多单出库"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                  @change="handleIsBuyExChange"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="订单编号" prop="orderNo">
                <business-autocomplete-basic
                  v-model="form.orderNo"
                  label="订单编号"
                  placeholder="请输入订单编号"
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
            <base-form-item label="客户名称" prop="customerName">
              <business-autocomplete-basic
                v-model="form.customerName"
                label="客户名称"
                placeholder="请输入客户名称"
                :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                @select="handleCustomerNameSelect"
                @clear="handleCustomerNameClear"
                @input="handleCustomerNameInput"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="仓库" prop="warehouseName">
              <business-autocomplete-warehouse
                v-model="form.warehouseName"
                value-key="warehouseName"
                label="仓库"
                placeholder="请输入仓库"
                :auto-assign="{
                  warehouseId: 'id'
                }"
                :form="form"
                @clear="() => (form.warehouseId = 0)"
              ></business-autocomplete-warehouse>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="出库日期" prop="shippingDate">
              <base-date-picker v-model="form.shippingDate" placeholder="选择出库日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="出库方式" prop="shippingType">
              <base-select
                v-model="form.shippingType"
                placeholder="请选择出库方式"
                :options="shippingTypeOptions"
                @change="handleShippingTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="收货公司" prop="deliveryCompany">
              <business-autocomplete-basic
                v-model="form.deliveryCompany"
                label="收货公司"
                placeholder="请输入收货公司"
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
            <base-form-item label="送货地址" prop="deliveryAddress">
              <base-input v-model="form.deliveryAddress" placeholder="请输入送货地址" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              :label="`${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}人`"
              prop="deliveryPerson"
            >
              <base-input
                v-model="form.deliveryPerson"
                :placeholder="`请输入${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}人`"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              :label="`${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}电话`"
              prop="deliveryMobile"
            >
              <base-input
                v-model="form.deliveryMobile"
                :placeholder="`请输入${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}电话`"
              />
            </base-form-item>
          </base-col>

          <base-col v-if="form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="6">
            <base-form-item label="提货人身份证" prop="deliveryIdCard">
              <base-input v-model="form.deliveryIdCard" placeholder="请输入提货人身份证" />
            </base-form-item>
          </base-col>

          <template v-if="form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
            <base-col :span="6">
              <base-form-item label="快递服务商" prop="expressName">
                <base-input v-model="form.expressName" placeholder="请输入快递服务商" />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="快递单号" prop="expressNo">
                <base-input v-model="form.expressNo" placeholder="请输入快递单号" />
              </base-form-item>
            </base-col>
          </template>

          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 出库明细 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          出库明细
        </span>
        <base-edit-table ref="detailsEditTableRef" height="300px" :show-added="false" :name="constant.TABLE_NAME_WARE_SHIPPING_ENTER">
          <template v-slot:buttons="{ selectRecords }">
            <el-button size="mini" type="primary" @click="handleCreate(selectRecords)">生成</el-button>
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

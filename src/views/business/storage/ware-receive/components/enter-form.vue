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
        orderNo: [{ required: true, message: '订单编号必填' }],
        customerName: [{ required: true, message: '客户名称必填' }],
        warehouseName: [{ required: true, message: '仓库必填' }],
        receivingType: [{ required: true, message: '入库方式必填' }],
        receivingDate: [{ required: true, message: '入库日期必填' }]
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

          // 默认是代理进口
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
    /** 明细列数据 */
    handleDetailsColumns() {
      const validProductModelAndProductName = ({ row }) => {
        if (!row.productName && !row.productModel) {
          return new Error('品名和型号必填其中一个')
        }
      }
      return [
        { field: 'partNo', width: 120, title: '料号', type: 'input' },
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
                onClear={() => this.handleProductNameClear(row)}
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
        {
          field: 'netWeight',
          width: 100,
          title: '净重',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        {
          field: 'grossWeight',
          width: 100,
          title: '毛重',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        { field: 'volume', width: 100, title: '体积', type: 'input' },
        {
          field: 'packages',
          width: 100,
          title: '件数',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        { field: 'lotNo', width: 100, title: '批号', type: 'input' },
        { field: 'dateCode', width: 100, title: '生产日期', type: 'input' },
        { field: 'ctnsNo', width: 100, title: '箱号', type: 'input' },
        { field: 'location', width: 100, title: '库位', type: 'input' },
        { field: 'remark', width: 100, title: '备注', type: 'input' }
      ]
    },
    rceivingTypesByAuditStatusOptions(receivingTypes) {
      const arr = [enums.RECEIVING_TYPE.getFieldByKey('CUSTOMS'), enums.RECEIVING_TYPE.getFieldByKey('ALLOCATE')]
      return this.form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')
        ? receivingTypes.filter(v => !arr.includes(v.value))
        : receivingTypes
    },
    // 处理订单tab页下的入库单新增补全明细和订单带过来的信息
    async handleAddedJumpAssign(obj) {
      const { orderId, orderType } = obj
      this.form.orderType = orderType
      const [res1, res2] = await Promise.all([this.getOrderTypeCorresOrder(orderId), this.getOrderTypeCorresDetailForReceive(orderId)])
      if (res1.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        const { id: orderId, orderNo, customerId, customerName, supplierId, supplierName, orderDeliveryTakeVOList } = res1.data
        // 我司收货信息
        const orderDeliveryTakeVO = {}
        if (orderDeliveryTakeVOList) {
          // 默认取第一条
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
      // 把所有能查询的入库订单信息生成出来
      if (res2.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        const orderDetailVOList = res2.data
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
        /* 代销订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_SALE')) {
        result = await getOrderAgentSaleById(orderId)
        /* 采购订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('PURCHASE')) {
        result = await getOrderPurchaseById(orderId)
        /* 仓储订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = await getOrderStorageById(orderId)
        /* 货代订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = await getOrderAgentFreightById(orderId)
      }

      return result
    },
    // 获取不同订单类型下订单入库信息
    async getOrderTypeCorresDetailForReceive(orderId, receive = {}) {
      let result = {}
      /* 进口订单 */
      if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        result = await getForReceivingOrderImportDetail(Object.assign({ orderId }, receive))
        /* 出口订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        result = await getForReceivingOrderExportDetail(Object.assign({ orderId }, receive))
        /* 代采订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
        result = await getForReceivingOrderAgentPurchaseDetail(Object.assign({ orderId }, receive))
        /* 代销订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_SALE')) {
        result = await getForReceivingOrderAgentSaleDetail(Object.assign({ orderId }, receive))
        /* 采购订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('PURCHASE')) {
        result = await getForReceivingOrderPurchaseDetail(Object.assign({ orderId }, receive))
        /* 仓储订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
        result = await getForReceivingOrderStorageDetail(Object.assign({ orderId }, receive))
        // /* 货代订单 */
      } else if (this.form.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
        result = await getForReceivingOrderAgentFreightDetail(Object.assign({ orderId }, receive))
      }

      return result
    },
    // 根据不同的订单类型去取默认的仓库
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
      // 进口订单
      if (orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        warehouseId = warehouseImportRkId
        warehouseName = warehouseImportRkName
        // 出口订单
      } else if (orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
        warehouseId = warehouseExportRkId
        warehouseName = warehouseExportRkName
        // TODO 剩下的订单类型默认都取的是境内仓库, 后面可能会有境外仓库的可能, 到时再进行判断
      } else {
        // 境内贸易模式和没有的贸易模式的默认取境内仓库
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
      // 空字符串除外
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

        /* form初始完，记得在修改状态时多赋值一个id */
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

      // 当订单类型为采购订单时, customerId为undefined需要自动置0
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
      if (this.form.orderNo === '') return this.$message.warning('请先选择订单编号')
      if (this.form.orderId === 0) return this.$message.warning('请先选择存在的订单编号')

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
      // 为了确保不会影响数据唯一性，删除之前的__XID,重新生成
      delete rows[0].__XID
      // 如果是最后一行
      if (currentIndex === records.length - 1) {
        await this.getDetailsEditTableInstance().loadData(rows[0], 'insert', -1)
      } else {
        await this.getDetailsEditTableInstance().loadData(rows[0], 'insert', records[currentIndex + 1])
      }
    },
    // 分摊毛净重
    handleApportion(rows) {
      this.apportion = {
        visible: true,
        rows
      }
    },
    // 分摊毛净重保存
    handleApportionSave(form, done) {
      let netWeightNum = 0
      let grossWeightNum = 0
      let netWeightSum = 0
      // 算出总数量
      const sum = this.apportion.rows.reduce((total, row) => {
        return new BigNumber(total).plus(row.qty).toNumber()
      }, 0)

      // 按净重分摊
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

      // 如果分配不完，剩余的补到第一条上面
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
      this.$message.success('操作成功')
      this.apportion.visible = false
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`入库明细: 第${rowIndex}行 ${rule.message}`)
            }
            const wareReceivingDetailDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign({ wareReceivingDetailDTOList }, this.form)
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveWareReceiving(formData)
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
              updateWareReceiving(formData)
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
    custom-class="common-form-dialog ware-receiving-dialog"
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
                :options="dicts[constant.DICTS_RECEIVE_ORDER_TYPE]"
                @change="handleOrderTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="订单编号" prop="orderNo">
              <business-autocomplete-basic
                v-model="form.orderNo"
                label="订单编号"
                placeholder="请输入订单编号"
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
            <base-form-item label="客户名称" prop="customerName">
              <business-autocomplete-basic
                v-model="form.customerName"
                label="客户名称"
                placeholder="请输入客户名称"
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
            <base-form-item label="供应商名称" prop="supplierName">
              <business-autocomplete-basic
                v-model="form.supplierName"
                label="供应商名称"
                placeholder="请输入供应商名称"
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
            <base-form-item label="入库日期" prop="receivingDate">
              <base-date-picker v-model="form.receivingDate" placeholder="选择出库日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="入库方式" prop="receivingType">
              <base-select
                v-model="form.receivingType"
                placeholder="请选择入库方式"
                :options="receivingTypeOptions"
                @change="handleReceivingTypeChange"
              />
            </base-form-item>
          </base-col>

          <template v-if="form.receivingType === enums.RECEIVING_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
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

      <!-- 入库明细 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          入库明细
        </span>
        <base-edit-table
          ref="detailsEditTableRef"
          show-sort
          height="300px"
          :show-added="false"
          :name="constant.TABLE_NAME_WARE_RECEIVING_ENTER"
        >
          <template v-slot:buttons="{ selectRecords }">
            <el-button size="mini" type="primary" @click="handleCreate(selectRecords)">生成</el-button>
            <el-button
              size="mini"
              type="primary"
              :disabled="!selectRecords.length || selectRecords.length > 1"
              @click="handleSplit(selectRecords)"
              >拆分</el-button
            >
            <el-button
              v-if="type === enums.FORM_TYPE.getFieldByKey('MODIFY')"
              size="mini"
              type="warning"
              :disabled="!(selectRecords.length > 1)"
              @click="handleApportion(selectRecords)"
              >分摊毛净重</el-button
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

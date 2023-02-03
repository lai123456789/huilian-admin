<script>
import { getOrderExportById, saveOrderExport, updateOrderExport } from '@/api/order/order-export'
import { orderExportDetailImportUrl, orderExportDetailExportUrl } from '@/api/order/order-export-detail'
import { getCompanyCusContractById } from '@/api/company/company-cus-contract'
import { getDataDictionary } from '@/api/admin/dicts'
import { getSysNo } from '@/api/admin/sys-no'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { filePrevie } from '@/utils'
import { clone } from 'xe-utils'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'
import Parts from './parts'

const form = {
  id: 0,
  tradeMode: '',
  customerId: 0,
  customerName: '',
  abroadCustomerName: '',
  abroadCustomerId: 0,
  supplierId: 0,
  supplierName: '',
  cusContractId: 0,
  cusContractNo: '',
  cusOrderNo: '',
  saleManName: '',
  saleManId: 0,
  tradeManName: '',
  tradeManId: 0,
  orderDate: dayjs().format('YYYY-MM-DD'),
  currencyName: '',
  settleCurrencyName: '',
  totalMoney: 0,
  totalPurchaseMoney: 0,
  declareTitle: '',
  incoterms: '',
  feeInsurRate: 0,
  packageType: '',
  remark: '',

  feeCurr: '',
  feeCurrCode: '',
  feeMark: enums.CUS_MARK_TYPE.getFieldByKey('RATE'),
  feeRate: 0,

  insurCurr: '',
  insurCurrCode: '',
  insurMark: enums.CUS_MARK_TYPE.getFieldByKey('RATE'),
  insurRate: 0,

  otherCurr: '',
  otherCurrCode: '',
  otherMark: enums.CUS_MARK_TYPE.getFieldByKey('RATE'),
  otherRate: 0,

  // 指定报关信息
  overseasShipper: '',
  portAddress: '',
  portTransport: '',
  portOfCall: '',
  customMaster: '',
  customMasterCode: '',
  waybillNo: '',
  customsBillNo: '',
  agentCustomsStatus: enums.WHETHER_STATUS.getFieldByKey('NO'),
  agentCustomsId: 0,
  agentCustomsName: '',

  // 订车信息
  carpoolFlag: enums.IS_CAR_POOLING.getFieldByKey('POOLING'),
  trafModeName: '',
  trafModeCode: '',
  transportDate: '',
  endWarehouseId: '',
  endWarehouseName: '',
  carType: '',
  containerNo: '',

  orderDeliveryTakeDTOList: [],
  orderDeliverySendDTOList: []
}

const orderDeliveryTake = {
  deliveryType: '',
  warehouseName: '',
  deliveryFilePath: '',
  deliveryFileId: '',
  deliveryFileName: '',
  fileList: [],
  deliveryCompany: '',
  takeDate: '',
  takeAddress: '',
  takePerson: '',
  takeMobile: '',
  expressName: '',
  expressNo: '',
  remark: ''
}

const orderDeliverySend = {
  deliveryCompany: '',
  deliveryFilePath: '',
  deliveryFileId: '',
  deliveryFileName: '',
  fileList: [],
  deliveryType: '',
  deliveryAddress: '',
  deliveryPerson: '',
  deliveryMobile: '',
  remark: '',
  expressName: '',
  deliveryIdCard: ''
}

export default {
  name: 'EnterForm',
  components: { Parts },
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
      orderExportDetailImportUrl,
      downloadConfig: {
        url: orderExportDetailExportUrl,
        params: {},
        fileName: '出口订单模板'
      },
      currentConstant: Object.freeze({
        CIF: 'CIF',
        FOB: 'FOB',
        FEE: 'FEE',
        INSUR: 'INSUR',
        OTHER: 'OTHER'
      }),
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        customerName: [{ required: true, message: '客户名称必填' }],
        // abroadCustomerName: [{ required: true, message: '境外客户必填' }],
        cusContractNo: [{ required: true, message: '服务协议必填' }],
        supplierName: [{ required: true, message: '供应商名称必填' }],
        orderDate: [{ required: true, message: '订单时间必填' }],
        currencyName: [{ required: true, message: '报关币别必填' }],
        saleManName: [{ required: true, message: '业务名称必填' }],
        tradeManName: [{ required: true, message: '商务名称必填' }],
        declareTitle: [{ required: true, message: '抬头方式必填' }],
        incoterms: [{ required: true, message: '成交方式必填' }],
        packageType: [{ required: true, message: '包装种类必填' }]
      },
      dicts: {},
      copyOrder: {
        enable: false,
        row: {},
        isCopyDetails: false
      },
      parts: {
        visible: false,
        row: {}
      },
      // 订单明细新增一行添加默认值
      insertAtRow: {
        destinationCountry: '',
        destinationCountryCode: void 0
      },
      isCusOrderNoRequired: false
    }
  },
  computed: {
    feeCurrRules() {
      return [{ required: this.form.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE'), message: '运费币制必填' }]
    },
    insurCurrRules() {
      return [
        {
          required: this.form.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE'),
          message: '保险费费币制必填'
        }
      ]
    },
    otherCurrRules() {
      return [{ required: this.form.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('TOTAL_PRICE'), message: '杂费币制必填' }]
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
        const {
          DICTS_TRADE_MODE,
          DICTS_DECLARE_TITLE,
          DICTS_CUS_MARK_TYPE,
          DICTS_TAKE_DELIVERY_TYPE,
          DICTS_DELIVERY_TYPE,
          DICTS_WHETHER_STATUS,
          DICTS_HIRING_TAXIE_TYPE
        } = constant
        Promise.all([
          getDataDictionary([
            DICTS_TRADE_MODE,
            DICTS_DECLARE_TITLE,
            DICTS_CUS_MARK_TYPE,
            DICTS_TAKE_DELIVERY_TYPE,
            DICTS_DELIVERY_TYPE,
            DICTS_WHETHER_STATUS,
            DICTS_HIRING_TAXIE_TYPE
          ]),
          type && getOrderExportById(this.tableRow.id),
          // 复制订单拿到的id先去请求详情获取数据
          this.copyOrder.enable && getOrderExportById(this.copyOrder.row.id),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_EXPORT_CUSTOMS_MASTER),
          getSysNo({ seqName: constant.SYS_NO_ORDER_EXPORT })
        ]).then(([dicts, info, copyInfo, defaultConfigRes, sysNos]) => {
          // 查询进口订单编号系统编码的状态为禁用时，客户合同号必填
          const sysNoImportOrders = sysNos.data.records
          this.isCusOrderNoRequired =
            sysNoImportOrders.length > 0 ? sysNoImportOrders[0].status === enums.ENABLE_DISABLE.getFieldByKey('DISABLE') : false

          this.dicts = dicts
          this.defaultConfig = defaultConfigRes.data
          if (type) {
            this.handleDataAssemble(info.data, true)
          } else {
            this.$refs.orderDetailsEditTableRef.loadColumns(this.handleDetailsColumns()).then(() => {
              Object.assign(this.form, {
                overseasShipper: this.defaultConfig ? this.defaultConfig.overseasConsignorName : '',
                portAddress: this.defaultConfig ? this.defaultConfig.entyPortName : '',
                portTransport: this.defaultConfig ? this.defaultConfig.tradeAreaName : '',
                portOfCall: this.defaultConfig ? this.defaultConfig.distinatePortName : ''
              })
              this.insertAtRow = {
                destinationCountryCode: this.defaultConfig ? this.defaultConfig.destinationCountryCode : '',
                destinationCountry: this.defaultConfig ? this.defaultConfig.destinationCountryName : ''
              }
              if (this.copyOrder.enable) {
                this.handleDataAssemble(copyInfo.data, this.copyOrder.isCopyDetails, 'copyOrder')
              }
            })
          }
        })
      })
    },
    handleDataAssemble(info, isDetails, type) {
      const { orderExportDetailVOList, orderDeliveryTakeVOList, orderDeliverySendVOList } = info

      Object.assign(
        this.form,
        info,
        {
          overseasShipper: info.overseasShipper || (this.defaultConfig ? this.defaultConfig.overseasConsignorName : ''),
          feeInsurRate: info.feeInsurRate || (this.defaultConfig ? this.defaultConfig.feeInsurRate : 0 || 0),
          feeRate:
            info.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
              ? new BigNumber(info.feeRate || (this.defaultConfig ? this.defaultConfig.feeRate : 0 || 0)).times(100).toNumber()
              : info.feeRate,
          insurRate:
            info.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
              ? new BigNumber(info.insurRate || (this.defaultConfig ? this.defaultConfig.insurRate : 0 || 0)).times(100).toNumber()
              : info.insurRate,
          otherRate:
            info.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
              ? new BigNumber(info.otherRate || (this.defaultConfig ? this.defaultConfig.otherRate : 0 || 0)).times(100).toNumber()
              : info.otherRate,
          portAddress: info.portAddress || (this.defaultConfig ? this.defaultConfig.entyPortName : ''),
          portTransport: info.portTransport || (this.defaultConfig ? this.defaultConfig.tradeAreaName : ''),
          portOfCall: info.portOfCall || (this.defaultConfig ? this.defaultConfig.distinatePortName : ''),
          destinationCountry: info.destinationCountry || (this.defaultConfig ? this.defaultConfig.destinationCountryName : '')
        },
        // 复制过来的订单对下面的字段清空操作
        type === 'copyOrder'
          ? {
              id: void 0,
              cusOrderNo: '',
              waybillNo: '',
              customsBillNo: ''
            }
          : {}
      )
      this.insertAtRow = {
        destinationCountry: info.destinationCountry || (this.defaultConfig ? this.defaultConfig.destinationCountryName : ''),
        destinationCountryCode: info.destinationCountryCode || (this.defaultConfig ? this.defaultConfig.destinationCountryCode : void 0)
      }
      this.$refs.orderDetailsEditTableRef.loadColumns(this.handleDetailsColumns()).then(() => {
        if (isDetails) {
          this.$refs.orderDetailsEditTableRef.loadData(
            (orderExportDetailVOList || []).map(record => ({
              ...record,
              id: type === 'copyOrder' ? 0 : record.id,
              orderId: type === 'copyOrder' ? 0 : record.orderId
            })),
            'cover'
          )
        }
      })
      this.form.orderDeliveryTakeDTOList = (orderDeliveryTakeVOList || []).map(take => ({
        ...take,
        fileList: [
          {
            id: take.deliveryFileId,
            name: take.deliveryFileName,
            url: take.deliveryFilePath
          }
        ]
      }))
      this.form.orderDeliverySendDTOList = (orderDeliverySendVOList || []).map(send => ({
        ...send,
        fileList: [
          {
            id: send.deliveryFileId,
            name: send.deliveryFileName,
            url: send.deliveryFilePath
          }
        ]
      }))
    },
    handleCustomerNameSelect(rows) {
      const { id, tradeManName, tradeManId, saleManId, saleManName, companyName } = rows[0]
      this.customerObj = rows[0]
      Object.assign(this.form, {
        tradeManName,
        tradeManId,
        saleManName,
        saleManId,
        // 置空服务协议
        cusContractNo: '',
        cusContractId: 0,
        customerName: companyName,
        customerId: id
      })
      this.advanceFlag = false
    },
    handleCustomerNameClear() {
      Object.assign(this.form, {
        customerId: 0
      })
    },
    async handleAbroadCusAddBeforeClick() {
      if (this.form.customerId === 0) {
        this.$message.warning('请先选择已存在的客户名称')
        return false
      }
      return true
    },
    handleCusContractNoSelect(rows) {
      const { id, contractNo, tradeMode } = rows[0]
      Object.assign(this.form, {
        cusContractNo: contractNo,
        cusContractId: id,
        tradeMode
      })
      getCompanyCusContractById(id).then(res => {
        const { cargoAdvanceFlag } = res.data.companyCusContractDetailVO
        this.advanceFlag = cargoAdvanceFlag === enums.WHETHER_STATUS.getFieldByKey('YES')
      })
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
    handleCusContractNoClear() {
      Object.assign(this.form, {
        cusContractNo: '',
        cusContractId: 0,
        tradeMode: ''
      })
      this.advanceFlag = false
    },
    handleAgentCustomsStatusChange() {
      Object.assign(this.form, {
        agentCustomsId: 0,
        agentCustomsName: ''
      })
      this.$refs.orderDetailsEditTableRef.loadColumns(this.handleDetailsColumns(), false)
    },
    onMarkChange(type) {
      if (type === this.currentConstant.FEE) {
        this.form.feeRate = 0
        this.form.feeCurr = ''
        this.form.feeCurrCode = ''
      } else if (type === this.currentConstant.INSUR) {
        this.form.insurRate = 0
        this.form.insurCurr = ''
        this.form.insurCurrCode = ''
      } else if (type === this.currentConstant.OTHER) {
        this.form.otherRate = 0
        this.form.otherCurr = ''
        this.form.otherCurrCode = ''
      }
    },
    handleIncotermsSelect(rows) {
      const { name } = rows[0]
      if (name === 'CIF') {
        Object.assign(this.form, {
          feeInsurRate: this.defaultConfig ? this.defaultConfig.feeInsurRate : 0 || 0,
          feeCurr: '',
          feeCurrCode: '',
          feeMark: '',
          feeRate: 0,
          insurCurr: '',
          insurCurrCode: '',
          insurMark: '',
          insurRate: 0,
          otherCurr: '',
          otherCurrCode: '',
          otherMark: '',
          otherRate: 0
        })
      } else if (name === 'FOB') {
        Object.assign(this.form, {
          feeInsurRate: 0,
          feeCurr: '',
          feeCurrCode: '',
          feeMark: enums.CUS_MARK_TYPE.getFieldByKey('RATE'),
          feeRate: this.defaultConfig ? this.defaultConfig.feeRate : 0 || 0,
          insurCurr: '',
          insurCurrCode: '',
          insurMark: enums.CUS_MARK_TYPE.getFieldByKey('RATE'),
          insurRate: this.defaultConfig ? this.defaultConfig.insurRate : 0 || 0,
          otherCurr: '',
          otherCurrCode: '',
          otherMark: enums.CUS_MARK_TYPE.getFieldByKey('RATE'),
          otherRate: this.defaultConfig ? this.defaultConfig.otherRate : 0 || 0
        })
      }
    },
    handleIncotermsBeforeInput() {
      Object.assign(this.form, {
        feeInsurRate: 0,
        feeCurr: '',
        feeCurrCode: '',
        feeMark: '',
        feeRate: 0,
        insurCurr: '',
        insurCurrCode: '',
        insurMark: '',
        insurRate: 0,
        otherCurr: '',
        otherCurrCode: '',
        otherMark: '',
        otherRate: 0
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
        { field: 'productBrand', width: 120, title: '品牌', type: 'input' },
        {
          field: 'productName',
          width: 120,
          title: '品名',
          rules: [{ validator: validProductModelAndProductName }],
          type: 'input'
        },
        {
          field: 'productModel',
          title: '型号规格',
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
                placeholder="请输入型号"
                label="型号"
                onSelect={rows => this.handleProductModelSelect(rows, row)}
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
          },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'qty')
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
          field: 'district',
          title: '境内货源地',
          width: 150,
          type: 'custom',
          rules: [{ required: true, message: '境内货源地必填' }],
          customRender: (h, { row, column }) => {
            return (
              <business-autocomplete-ccl
                vModel={row[column.field]}
                size="mini"
                module-name={constant.AUTOCOMPLETE_KEY_CCL_DISTRICT}
                label="境内货源地"
                placeholder="请输入境内货源地"
                auto-assign={{
                  districtCode: 'code'
                }}
                form={row}
                onClear={() => (row.districtCode = void 0)}
              />
            )
          }
        },

        {
          field: 'destinationCountry',
          title: '最终目的国(地区)',
          width: 170,
          type: 'custom',
          customRender: (h, { row, column }) => {
            return (
              <business-autocomplete-ccl
                vModel={row[column.field]}
                size="mini"
                module-name={constant.AUTOCOMPLETE_KEY_CCL_COUNTRY}
                label="最终目的国(地区)"
                placeholder="请输入最终目的国(地区)"
                auto-assign={{
                  destinationCountryCode: 'code'
                }}
                form={row}
                onClear={() => (row.destinationCountryCode = void 0)}
              />
            )
          }
        },
        {
          field: 'price',
          width: 120,
          title: '报关单价',
          type: 'inputNumber',
          rules: [{ required: true, message: '报关单价必填' }],
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          },
          footerConfig: { precision: 6 },
          attrs: {
            precision: 6
          },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'price')
          }
        },
        {
          field: 'totalMoney',
          width: 120,
          title: '报关总价',
          type: 'inputNumber',
          rules: [{ required: true, message: '报关总价必填' }],
          sum: true,
          attrs: {
            precision: 2
          },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'totalMoney')
          }
        },
        {
          field: 'netWeight',
          width: 100,
          title: '净重 ',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        {
          field: 'grossWeight',
          width: 100,
          title: '毛重 ',
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
          title: '件数 ',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        {
          field: 'partNo',
          title: '料号',
          width: 120,
          type: 'input'
        },
        {
          field: 'lotNo',
          title: '批号',
          width: 100,
          type: 'input'
        },
        {
          field: 'spq',
          width: 100,
          title: '包装数量 ',
          type: 'inputNumber',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        {
          field: 'dateCode',
          width: 100,
          title: '生产日期',
          type: 'input'
        },
        { field: 'remark', title: '备注', type: 'input', width: 120 }
      ]
    },
    /** 计算订单明细价格 */
    calcPrice(_a, _b, scope, type) {
      const { row } = scope
      if (type === 'totalMoney') {
        if (row.qty) {
          row.price = new BigNumber(row.totalMoney || 0)
            .div(row.qty || 0)
            .dp(6)
            .toNumber()
        }
      } else {
        row.totalMoney = new BigNumber(row.qty || 0)
          .times(row.price || 0)
          .dp(2)
          .toNumber()
      }
      this.calcTotalMoney()
    },
    calcTotalMoney() {
      if (this.$refs.orderDetailsEditTableRef) {
        const tableData = this.$refs.orderDetailsEditTableRef.getRecords()
        this.form.totalMoney = tableData.reduce((total, row) => {
          return new BigNumber(total)
            .plus(row.totalMoney || 0)
            .dp(2)
            .toNumber()
        }, 0)
      }
    },
    handleTableDelete() {
      this.calcTotalMoney()
    },
    /** 我司收货信息操作 */
    handleTakeAdd() {
      this.form.orderDeliveryTakeDTOList.unshift(clone(orderDeliveryTake, true))
    },
    handleTakeDel(_, index) {
      this.form.orderDeliveryTakeDTOList.splice(index, 1)
    },
    handleTakeDeliveryChange(_, item) {
      item.warehouseName = ''
      item.warehouseId = 0
      item.deliveryFilePath = ''
      item.deliveryFileId = 0
      item.deliveryFileName = ''
      item.fileList = []
      item.deliveryCompany = ''
      item.takeDate = ''
      item.takeAddress = ''
      item.takePerson = ''
      item.takeMobile = ''
      item.expressName = ''
      item.expressNo = ''
      item.remark = ''
    },
    handleWarehouseSelect(rows, item) {
      const { id, warehouseName, warehouseAddress, person, mobile, phone } = rows[0]
      item.warehouseId = id
      item.warehouseName = warehouseName
      /* 收货方式不为调度提货和我司自提, 从收货仓库带值 */
      if (!this.handleTakeCondition(item.deliveryType)) {
        item.takeAddress = warehouseAddress
        item.takePerson = person
        item.takeMobile = mobile && !phone ? mobile : !mobile && phone ? phone : mobile && phone ? `${mobile}/${phone}` : ''
      }
    },
    handleTakeAddressSelect(rows, item) {
      if (this.handleTakeCondition(item.deliveryType)) {
        const { person, mobile } = rows[0]
        item.takePerson = person
        item.takeMobile = mobile
      } else {
        const { person, mobile, phone } = rows[0]
        if (!this.handleTakeCondition(item.deliveryType)) {
          item.takePerson = person
          item.takeMobile = mobile && !phone ? mobile : !mobile && phone ? phone : mobile && phone ? `${mobile}/${phone}` : ''
        }
      }
    },
    takeUploadSuccess(item, response, file, fileList) {
      if (response.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        item.deliveryFilePath = response.data.url
        item.deliveryFileId = response.data.id
        item.deliveryFileName = file.name
        item.fileList = fileList
      }
    },
    /** 客户收货信息操作 */
    handleSendAdd() {
      this.form.orderDeliverySendDTOList.unshift(clone(orderDeliverySend, true))
    },
    handleSendDel(_, index) {
      this.form.orderDeliverySendDTOList.splice(index, 1)
    },
    handleSendDeliveryChange(item) {
      // 清空之前的数据
      item.deliveryCompany = ''
      item.deliveryFilePath = ''
      item.deliveryFileId = 0
      item.deliveryFileName = ''
      item.fileList = []
      item.deliveryAddress = ''
      item.deliveryPerson = ''
      item.deliveryMobile = ''
      item.remark = ''
      item.expressName = ''
      item.deliveryIdCard = ''
    },
    handleSendAddressSelect(rows, item) {
      const { deliveryCompany, person, mobile } = rows[0]
      item.deliveryCompany = deliveryCompany
      item.deliveryPerson = person
      item.deliveryMobile = mobile
    },
    sendUploadSuccess(item, response, file, fileList) {
      if (response.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        item.deliveryFilePath = response.data.url
        item.deliveryFileId = response.data.id
        item.deliveryFileName = file.name
        item.fileList = fileList
      }
    },

    // 复制订单
    handleCopyOrder(enable, row = {}, isCopyDetails = false) {
      this.copyOrder = {
        enable,
        row,
        isCopyDetails
      }
    },
    handleParts(rows) {
      if (!rows[0].productModel) return this.$message.error('请选择有型号的记录')
      this.parts = {
        visible: true,
        row: rows[0]
      }
    },
    handlePartsSave(row, data, done) {
      row.orderImportDetailPartDTOList = data
      this.parts = {
        visible: false,
        row: {}
      }
      done()
    },
    handleImportResult(res, status, done) {
      if (status === 'success') {
        if (res.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
          this.$nextTick(async () => {
            const orderImportDetailVOList = res.data || []
            this.$refs.orderDetailsEditTableRef.clearSelectRows()
            await this.$refs.orderDetailsEditTableRef.loadData(orderImportDetailVOList, 'cover')
            this.$message.success('导入成功')
            done()
          })
        } else {
          if (res.data && res.data.length) {
            let msg = ''
            res.data.forEach(v => {
              msg += `第${v.lineNum}行, ${v.errors}; </br>`
            })
            this.$message.error({
              dangerouslyUseHTMLString: true,
              message: msg
            })
          } else {
            this.$message.error(res.msg)
          }
        }
      } else {
        this.$message.error('服务器异常,请联系管理员')
      }
    },
    handleFilePreview(file) {
      filePrevie({ fileName: file.name, path: file.response ? file.response.data.url : file.url })
    },
    handleTakeCondition(value) {
      return [enums.TAKE_DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY'), enums.TAKE_DELIVERY_TYPE.getFieldByKey('TAKE_SELF')].includes(value)
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.$refs.orderDetailsEditTableRef.validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`订单明细: 第${rowIndex}行 ${rule.message}`)
            }
            const orderExportDetailDTOList = this.$refs.orderDetailsEditTableRef.getRecords()
            const formData = Object.assign(
              { orderExportDetailDTOList: orderExportDetailDTOList.map(v => ({ ...v, id: v.id || 0 })) },
              this.form
            )
            Object.assign(formData, {
              feeRate:
                formData.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(formData.feeRate).div(100).toNumber()
                  : formData.feeRate,
              insurRate:
                formData.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(formData.insurRate).div(100).toNumber()
                  : formData.insurRate,
              otherRate:
                formData.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(formData.otherRate).div(100).toNumber()
                  : formData.otherRate
            })
            const submitData = () => {
              if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
                saveOrderExport(formData)
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
                updateOrderExport(formData)
                  .then(() => {
                    this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}成功`)
                    this.visible = false
                    done()
                    this.$emit('edit-save', Object.assign({ isCusOrderNoRequired: this.isCusOrderNoRequired }, this.form))
                    // 刷新表格的时候，保存之前选中的数据
                    this.reLoad(true)
                  })
                  .catch(() => {
                    done()
                  })
              }
            }
            const isThan = orderExportDetailDTOList.some(item => item.netWeight > item.grossWeight)
            if (isThan) {
              this.$confirm('当前订单明细存在毛重小于净重数据，是否继续', '提示')
                .then(() => {
                  submitData()
                })
                .catch(() => {
                  done()
                })
            } else {
              submitData()
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
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="98%"
    custom-class="common-form-dialog export-order-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="客户名称" prop="customerName">
              <business-autocomplete-basic
                v-model="form.customerName"
                label="客户名称"
                placeholder="请输入客户名称"
                :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                @select="handleCustomerNameSelect"
                @clear="handleCustomerNameClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="境外客户" prop="abroadCustomerName">
              <business-autocomplete-cus-customer
                v-model="form.abroadCustomerName"
                value-key="companyNameEn"
                label="境外客户"
                placeholder="请输入境外客户"
                :params="{
                  companyRegion: enums.COMPANY_REGION.getFieldByKey('ABROAD'),
                  customerId: form.customerId
                }"
                :add-before-click="handleAbroadCusAddBeforeClick"
                :auto-assign="{
                  abroadCustomerId: 'id',
                  overseasShipper: 'companyNameEn'
                }"
                :form="form"
                @clear="() => (form.abroadCustomerId = 0)"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="服务协议" prop="cusContractNo">
              <business-autocomplete-basic
                v-model="form.cusContractNo"
                label="服务协议"
                placeholder="请输入服务协议"
                :params="{
                  customerId: form.customerId,
                  status: enums.AGREE_STATUS.getFieldByKey('SUCCESS'),
                  tradeMode: [enums.TRADE_MODE.getFieldByKey('EXPORT_AGENT'), enums.TRADE_MODE.getFieldByKey('EXPORT_SELF')].join(',')
                }"
                :module-name="constant.AUTOCOMPLETE_KEY_SERVICE_AGREE"
                @select="handleCusContractNoSelect"
                @clear="handleCusContractNoClear"
              >
                <template v-slot="{ option }">
                  <span>{{ `${option.contractNo} (${option.principalShortName})` }}</span>
                </template>
              </business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="贸易模式" prop="tradeMode">
              <base-select v-model="form.tradeMode" disabled placeholder="请选择贸易模式" :options="dicts[constant.DICTS_TRADE_MODE]" />
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
            <base-form-item label="订单日期" prop="orderDate">
              <base-date-picker v-model="form.orderDate" placeholder="请输入订单日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="客户合同号" prop="cusOrderNo" :rules="[{ required: isCusOrderNoRequired, message: '客户合同号必填' }]">
              <base-input v-model="form.cusOrderNo" placeholder="请输入客户合同号" @input="value => (form.customsBillNo = value)" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="报关币别" prop="currencyName">
              <business-autocomplete-basic
                v-model="form.currencyName"
                label="报关币别"
                placeholder="请输入报关币别"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="报关总价" prop="totalMoney">
              <base-input-number v-model="form.totalMoney" readonly placeholder="请输入报关总价" :precision="2" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="抬头方式" prop="declareTitle">
              <base-select v-model="form.declareTitle" placeholder="请选择抬头方式" :options="dicts[constant.DICTS_DECLARE_TITLE]" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="成交方式" prop="incoterms">
              <business-autocomplete-ccl
                v-model="form.incoterms"
                label="成交方式"
                placeholder="请输入成交方式"
                :before-input="handleIncotermsBeforeInput"
                :show-more="false"
                :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSACTION_MODE"
                @select="handleIncotermsSelect"
              ></business-autocomplete-ccl>
            </base-form-item>
          </base-col>

          <base-col v-if="form.incoterms === currentConstant.CIF" :span="6">
            <base-form-item label="运保费比例" prop="feeInsurRate">
              <base-input-number v-model="form.feeInsurRate" placeholder="请输入运保费比例" :precision="4" />
            </base-form-item>
          </base-col>

          <template v-if="form.incoterms === currentConstant.FOB">
            <base-col :span="6">
              <base-form-item label="运费">
                <div class="form-group">
                  <base-form-item style="width: 50px" prop="feeMark">
                    <base-select
                      v-model="form.feeMark"
                      :clearable="false"
                      :options="dicts[constant.DICTS_CUS_MARK_TYPE]"
                      @change="() => onMarkChange(currentConstant.FEE)"
                    />
                  </base-form-item>
                  <base-form-item style="width: 80px" prop="feeRate">
                    <base-input-number
                      v-model="form.feeRate"
                      :precision="form.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? 4 : 2"
                    />
                  </base-form-item>
                  <base-form-item style="flex: 1" prop="feeCurr" :rules="feeCurrRules">
                    <business-autocomplete-ccl
                      v-model="form.feeCurr"
                      :disabled="form.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')"
                      :show-more="false"
                      label="币制"
                      placeholder="请输入币制"
                      :auto-assign="{
                        feeCurrCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_CURRENCY"
                      @clear="() => (form.feeCurrCode = '')"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </div>
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="保险费">
                <div class="form-group">
                  <base-form-item style="width: 50px" prop="insurMark">
                    <base-select
                      v-model="form.insurMark"
                      :clearable="false"
                      :options="dicts[constant.DICTS_CUS_MARK_TYPE]"
                      @change="() => onMarkChange(currentConstant.INSUR)"
                    />
                  </base-form-item>
                  <base-form-item style="width: 80px" prop="insurRate">
                    <base-input-number
                      v-model="form.insurRate"
                      :precision="form.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? 4 : 2"
                    />
                  </base-form-item>
                  <base-form-item style="flex: 1" prop="insurCurr" :rules="insurCurrRules">
                    <business-autocomplete-ccl
                      v-model="form.insurCurr"
                      :disabled="form.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')"
                      :show-more="false"
                      label="币制"
                      placeholder="请输入币制"
                      :auto-assign="{
                        insurCurrCode: 'code'
                      }"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_CURRENCY"
                      @clear="() => (form.insurCurrCode = '')"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </div>
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="杂费">
                <div class="form-group">
                  <base-form-item style="width: 50px" prop="otherMark">
                    <base-select
                      v-model="form.otherMark"
                      :clearable="false"
                      :options="dicts[constant.DICTS_CUS_MARK_TYPE]"
                      @change="() => onMarkChange(currentConstant.OTHER)"
                    />
                  </base-form-item>
                  <base-form-item style="width: 80px" prop="otherRate">
                    <base-input-number
                      v-model="form.otherRate"
                      :precision="form.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE') ? 4 : 2"
                    />
                  </base-form-item>
                  <base-form-item style="flex: 1" prop="otherCurr" :rules="otherCurrRules">
                    <business-autocomplete-ccl
                      v-model="form.otherCurr"
                      :disabled="form.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')"
                      :show-more="false"
                      label="币制"
                      placeholder="请输入币制"
                      :auto-assign="{
                        otherCurrCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_CURRENCY"
                      @clear="() => (form.otherCurrCode = '')"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </div>
              </base-form-item>
            </base-col>
          </template>

          <base-col :span="6">
            <base-form-item label="包装种类" prop="packageType">
              <business-autocomplete-ccl
                v-model="form.packageType"
                label="包装种类"
                placeholder="请输入包装种类"
                :module-name="constant.AUTOCOMPLETE_KEY_CCL_WRAP_TYPE"
              ></business-autocomplete-ccl>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="业务名称" prop="saleManName">
              <business-autocomplete-basic
                v-model="form.saleManName"
                key-field="userId"
                label="业务名称"
                placeholder="请输入业务名称"
                :module-name="constant.AUTOCOMPLETE_KEY_SALEMAN"
                :auto-assign="{
                  saleManId: 'userId'
                }"
                :form="form"
                @clear="() => (form.saleManId = 0)"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="商务名称" prop="tradeManName">
              <business-autocomplete-basic
                v-model="form.tradeManName"
                key-field="userId"
                label="商务名称"
                placeholder="请输入商务名称"
                :module-name="constant.AUTOCOMPLETE_KEY_TRADEMAN"
                :auto-assign="{
                  tradeManId: 'userId'
                }"
                :form="form"
                @clear="() => (form.tradeManId = 0)"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="采购总价" prop="totalPurchaseMoney">
              <base-input v-model="form.totalPurchaseMoney" readonly />
            </base-form-item>
          </base-col>

          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 指定报关信息 -->
      <div class="common-form-block customs-info">
        <el-collapse class="collapse">
          <el-collapse-item>
            <template #title>
              <i class="icon el-icon-s-grid"></i>
              <span>指定报关信息</span>
            </template>
            <div class="content">
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="境外收货人" prop="overseasShipper">
                    <base-input v-model="form.overseasShipper" placeholder="请输入境外收货人" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="离境口岸" prop="portAddress">
                    <business-autocomplete-ccl
                      v-model="form.portAddress"
                      label="离境口岸"
                      placeholder="请输入离境口岸"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="运抵国" prop="portTransport">
                    <business-autocomplete-ccl
                      v-model="form.portTransport"
                      label="运抵国"
                      placeholder="请输入运抵国"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="指运港" prop="portOfCall">
                    <business-autocomplete-ccl
                      v-model="form.portOfCall"
                      label="指运港"
                      placeholder="请输入指运港"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="提运单号" prop="waybillNo">
                    <base-input v-model="form.waybillNo" placeholder="请输入提运单号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="报关合同号" prop="customsBillNo">
                    <base-input v-model="form.customsBillNo" placeholder="请输入报关合同号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="申报地海关" prop="customMaster">
                    <business-autocomplete-ccl
                      v-model="form.customMaster"
                      label="申报地海关"
                      placeholder="请输入申报地海关"
                      :auto-assign="{
                        customMasterCode: 'code'
                      }"
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_CUSTOMS"
                      @clear="() => (form.customMasterCode = '')"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="是否委外报关" prop="agentCustomsStatus">
                    <base-select
                      v-model="form.agentCustomsStatus"
                      placeholder="请选择是否委外报关"
                      :clearable="false"
                      :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      @change="handleAgentCustomsStatusChange"
                    />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.agentCustomsStatus === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="6">
                  <base-form-item label="报关行" prop="agentCustomsName">
                    <business-autocomplete-basic
                      v-model="form.agentCustomsName"
                      label="报关行"
                      placeholder="请输入报关行"
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMS"
                      :auto-assign="{
                        agentCustomsId: 'id'
                      }"
                      :form="form"
                      @clear="() => (form.agentCustomsId = 0)"
                    />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 订单明细 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          订单明细
        </span>
        <base-edit-table
          ref="orderDetailsEditTableRef"
          height="300px"
          :insert-at-row="insertAtRow"
          :name="constant.TABLE_NAME_EXPORT_ORDER_ENTER"
          @delete="handleTableDelete"
        >
          <template v-slot:buttons="{ selectRecords }">
            <el-button
              size="mini"
              :disabled="!selectRecords.length || selectRecords.length > 1"
              type="primary"
              @click="handleParts(selectRecords)"
              >配件列表</el-button
            >
            <business-import-button :action="orderExportDetailImportUrl" :download-config="downloadConfig" @result="handleImportResult" />
          </template>
        </base-edit-table>
      </div>

      <!-- 订车信息 -->
      <div class="common-form-block customs-info">
        <el-collapse class="collapse">
          <el-collapse-item>
            <template #title>
              <i class="icon el-icon-s-grid"></i>
              <span>订车信息</span>
            </template>
            <div class="content">
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="是否拼车" prop="carpoolFlag">
                    <base-select
                      v-model="form.carpoolFlag"
                      placeholder="请选择是否拼车"
                      :clearable="false"
                      :options="dicts[constant.DICTS_WHETHER_STATUS]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="运输方式" prop="trafModeName">
                    <business-autocomplete-ccl
                      v-model="form.trafModeName"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSPORT"
                      label="运输方式"
                      placeholder="请选择运输方式"
                      value-key="name"
                      :auto-assign="{
                        trafModeCode: 'code'
                      }"
                      :form="form"
                      @clear="() => ((form.trafModeCode = ''), (form.carType = ''))"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="运输日期" prop="transportDate">
                    <base-date-picker v-model="form.transportDate" placeholder="请选择运输日期" />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('LAND')" :span="6">
                  <base-form-item label="订车类型" prop="carType">
                    <base-select
                      v-model="form.carType"
                      placeholder="请选择订车类型"
                      :clearable="false"
                      :options="dicts[constant.DICTS_HIRING_TAXIE_TYPE]"
                      @change="() => (form.containerNo = '')"
                    />
                  </base-form-item>
                </base-col>

                <base-col
                  v-if="
                    form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME') ||
                    form.carType === enums.CAR_TYPE.getFieldByKey('TANK')
                  "
                  :span="6"
                >
                  <base-form-item label="柜号" prop="containerNo">
                    <base-input v-model="form.containerNo" placeholder="请输入柜号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="目的仓" prop="endWarehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.endWarehouseName"
                      label="目的仓"
                      placeholder="请选择目的仓"
                      value-key="warehouseName"
                      :auto-assign="{
                        endWarehouseId: 'id'
                      }"
                      :form="form"
                      @clear="() => (form.endWarehouseId = 0)"
                    />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 我司收货信息 -->
      <div class="common-form-block">
        <el-collapse class="collapse">
          <el-collapse-item>
            <template #title>
              <i class="icon el-icon-s-grid"></i>
              <span>我司收货信息</span>
            </template>
            <div class="content">
              <div class="delivery">
                <el-button type="primary" size="mini" @click="handleTakeAdd">新增一条</el-button>
                <div class="delivery-card">
                  <div v-if="!form.orderDeliveryTakeDTOList.length" class="empty-wrap">
                    <base-empty />
                  </div>
                  <el-card v-for="(item, index) in form.orderDeliveryTakeDTOList" :key="`take_${index}`" class="take-vo box-card">
                    <div slot="header" class="header">
                      <span class="card-header-title">{{ `我司收货信息 ( ${index + 1} )` }}</span>
                      <el-button-group class="logistics-button-group">
                        <el-button type="danger" size="mini" @click="handleTakeDel(item, index)">删除</el-button>
                      </el-button-group>
                    </div>
                    <div class="text item">
                      <base-row :gutter="10">
                        <base-col :span="6">
                          <base-form-item label="收货方式" :prop="`orderDeliveryTakeDTOList.${index}.deliveryType`">
                            <base-select
                              v-model="item.deliveryType"
                              placeholder="请选择收货方式"
                              :options="dicts[constant.DICTS_TAKE_DELIVERY_TYPE]"
                              @change="value => handleTakeDeliveryChange(value, item)"
                            />
                          </base-form-item>
                        </base-col>

                        <base-col :span="6">
                          <base-form-item label="收货仓库" :prop="`orderDeliveryTakeDTOList.${index}.warehouseName`">
                            <business-autocomplete-warehouse
                              v-model="item.warehouseName"
                              value-key="warehouseName"
                              label="收货仓库"
                              placeholder="请输入收货仓库"
                              :module-name="constant.AUTOCOMPLETE_KEY_WAREHOUSE"
                              :params="{ status: enums.ENABLE_DISABLE.getFieldByKey('ENABLED') }"
                              @select="rows => handleWarehouseSelect(rows, item)"
                              @clear="() => (item.warehouseId = 0)"
                            ></business-autocomplete-warehouse>
                          </base-form-item>
                        </base-col>
                      </base-row>

                      <base-row :gutter="10">
                        <base-col :span="6">
                          <base-form-item label="提货地址" :prop="`orderDeliveryTakeDTOList.${index}.takeAddress`">
                            <base-input
                              v-if="!handleTakeCondition(item.deliveryType)"
                              v-model="item.takeAddress"
                              placeholder="请输入仓库地址"
                            />
                            <template v-else>
                              <business-autocomplete-basic
                                v-model="item.takeAddress"
                                label="提货地址"
                                placeholder="请输入提货地址"
                                :is-exist="false"
                                :module-name="constant.AUTOCOMPLETE_KEY_CUS_DELIVERY"
                                :params="{ customerId: '0', addressType: enums.ADDRESS_TYPE.getFieldByKey('PICKUP') }"
                                @select="rows => handleTakeAddressSelect(rows, item)"
                              ></business-autocomplete-basic>
                            </template>
                          </base-form-item>
                        </base-col>
                        <base-col :span="6">
                          <base-form-item
                            :label="`${handleTakeCondition(item.deliveryType) ? '提货' : '仓库'}联系人`"
                            :prop="`orderDeliveryTakeDTOList.${index}.takePerson`"
                          >
                            <base-input
                              v-model="item.takePerson"
                              :placeholder="`请输入${handleTakeCondition(item.deliveryType) ? '提货' : '仓库'}人`"
                            />
                          </base-form-item>
                        </base-col>
                        <base-col :span="6">
                          <base-form-item
                            :label="`${handleTakeCondition(item.deliveryType) ? '提货' : '仓库'}联系电话`"
                            :prop="`orderDeliveryTakeDTOList.${index}.takeMobile`"
                          >
                            <base-input
                              v-model="item.takeMobile"
                              :placeholder="`请输入${handleTakeCondition(item.deliveryType) ? '提货' : '仓库'}联系电话`"
                            />
                          </base-form-item>
                        </base-col>
                        <!-- 收货方式为调度提货 -->
                        <base-col v-if="handleTakeCondition(item.deliveryType)" :span="6">
                          <base-form-item label="提货附件">
                            <base-upload
                              is-upload-only-one-file
                              :file-list="item.fileList"
                              :on-preview="handleFilePreview"
                              :data="{
                                fileModule: constant.FILE_MODULE_EXPORT_ORDER_TAKE_DELIBERY,
                                recordId: form.id,
                                fileType: '普通附件'
                              }"
                              :on-success="(response, file, fileList) => takeUploadSuccess(item, response, file, fileList)"
                            ></base-upload>
                          </base-form-item>
                        </base-col>
                      </base-row>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 客户收货信息 -->
      <div class="common-form-block">
        <el-collapse class="collapse">
          <el-collapse-item>
            <template #title>
              <i class="icon el-icon-s-grid"></i>
              <span>客户收货信息</span>
            </template>
            <div class="content">
              <div class="delivery">
                <el-button type="primary" size="mini" @click="handleSendAdd">新增一条</el-button>
                <div class="delivery-card">
                  <div v-if="!form.orderDeliverySendDTOList.length" class="empty-wrap">
                    <base-empty />
                  </div>
                  <el-card v-for="(item, index) in form.orderDeliverySendDTOList" :key="`send_${index}`" class="take-vo box-card">
                    <div slot="header" class="header">
                      <span class="card-header-title">{{ `客户收货信息 ( ${index + 1} )` }}</span>
                      <el-button-group class="logistics-button-group">
                        <el-button type="danger" size="mini" @click="handleSendDel(item, index)">删除</el-button>
                      </el-button-group>
                    </div>
                    <div class="text item">
                      <base-row :gutter="10">
                        <base-col :span="6">
                          <base-form-item label="送货方式" :prop="`orderDeliverySendDTOList.${index}.deliveryType`">
                            <base-select
                              v-model="item.deliveryType"
                              placeholder="请选择送货方式"
                              :options="dicts[constant.DICTS_DELIVERY_TYPE]"
                              @change="() => handleSendDeliveryChange(item)"
                            />
                          </base-form-item>
                        </base-col>

                        <base-col v-if="item.deliveryType !== enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="6">
                          <base-form-item label="收货地址" :prop="`orderDeliverySendDTOList.${index}.deliveryAddress`">
                            <business-autocomplete-basic
                              v-model="item.deliveryAddress"
                              label="收货地址"
                              placeholder="请输入收货地址"
                              :is-exist="false"
                              :module-name="constant.AUTOCOMPLETE_KEY_CUS_DELIVERY"
                              :params="{ customerId: '0', addressType: enums.ADDRESS_TYPE.getFieldByKey('RECEIVING') }"
                              @select="rows => handleSendAddressSelect(rows, item)"
                            ></business-autocomplete-basic>
                          </base-form-item>
                        </base-col>

                        <!-- 收货方式不为客户自提 -->
                        <base-col v-if="item.deliveryType !== enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="6">
                          <base-form-item label="收货公司" :prop="`orderDeliverySendDTOList.${index}.deliveryCompany`">
                            <base-input v-model="item.deliveryCompany" placeholder="请输入收货公司" />
                          </base-form-item>
                        </base-col>
                        <base-col :span="6">
                          <base-form-item
                            :label="`${item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}人`"
                            :prop="`orderDeliverySendDTOList.${index}.deliveryPerson`"
                          >
                            <base-input
                              v-model="item.deliveryPerson"
                              :placeholder="`请输入${
                                item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'
                              }人`"
                            />
                          </base-form-item>
                        </base-col>
                        <base-col :span="6">
                          <base-form-item
                            :label="`${item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}电话`"
                            :prop="`orderDeliverySendDTOList.${index}.deliveryMobile`"
                          >
                            <base-input
                              v-model="item.deliveryMobile"
                              :placeholder="`请输入${
                                item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'
                              }电话`"
                            />
                          </base-form-item>
                        </base-col>

                        <!-- 送货方式不为客户自提 -->
                        <template v-if="item.deliveryType !== enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')">
                          <!-- 送货方式为快递发货 -->
                          <base-col v-if="item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('EXPRESS_DELIVERY')" :span="6">
                            <base-form-item label="快递公司" :prop="`orderDeliverySendDTOList.${index}.expressName`">
                              <base-input v-model="item.expressName" placeholder="请输入快递公司" />
                            </base-form-item>
                          </base-col>
                          <base-col :span="12">
                            <base-form-item label="收货备注" :prop="`orderDeliverySendDTOList.${index}.remark`">
                              <base-input v-model="item.remark" type="textarea" placeholder="请输入收货备注" />
                            </base-form-item>
                          </base-col>
                        </template>

                        <!-- 送货方式为客户自提 -->
                        <template v-if="item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')">
                          <base-col :span="6">
                            <base-form-item label="提货人身份证" :prop="`orderDeliverySendDTOList.${index}.deliveryIdCard`">
                              <base-input v-model="item.deliveryIdCard" placeholder="请输入提货人身份证" />
                            </base-form-item>
                          </base-col>
                          <base-col :span="6">
                            <base-form-item label="提货附件">
                              <base-upload
                                is-upload-only-one-file
                                :file-list="item.fileList"
                                :on-preview="handleFilePreview"
                                :data="{
                                  fileModule: constant.FILE_MODULE_EXPORT_ORDER_SEND_DELIBERY,
                                  recordId: form.id,
                                  fileType: '普通附件'
                                }"
                                :on-success="(response, file, fileList) => sendUploadSuccess(item, response, file, fileList)"
                              ></base-upload>
                            </base-form-item>
                          </base-col>
                        </template>
                      </base-row>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </base-form>
    <parts v-model="parts.visible" :main-row="parts.row" @save="handlePartsSave" />
  </base-dialog>
</template>

<style lang="scss">
.export-order-dialog {
  .common-form-block {
    &.is-special {
      box-sizing: border-box;
      padding-bottom: 10px;
      .common-form-block-header {
        margin-bottom: 10px;
      }
    }
    &.customs-info {
      .el-collapse-item__content {
        .content {
          padding-top: 16px;
        }
      }
    }
  }
  .form-group {
    display: flex;
    .el-input__suffix {
      display: none;
    }
    .el-input__inner {
      padding-right: 4px;
      padding-left: 4px;
    }
    .el-form-item {
      margin-bottom: 0;
    }
  }
  .collapse {
    .el-collapse-item__header {
      padding-left: 20px;
      height: 42px;
      font-size: 14px;
      font-weight: 400;
      border-bottom: 1px solid #eeeeee;
      color: #606266;
      line-height: 42px;
      &.focusing:focus:not(:hover) {
        color: #606266;
      }
      .icon {
        display: inline-block;
        margin-top: 2px;
        margin-right: 5px;
        font-size: 14px;
        color: var(--color-primary);
        vertical-align: middle;
      }
    }
    .el-collapse-item__content {
      padding-bottom: 3px;
      .content {
        padding-top: 10px;
        height: 100%;
      }
    }
  }
  .delivery {
    padding: 0 10px;
    .delivery-card {
      margin-top: 10px;
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .take-vo {
        margin-bottom: 10px;
        .el-card__header {
          padding: 10px 15px;
        }
        .card-header-title {
          font-size: 14px;
        }
        .el-row {
          max-width: 1300px;
        }
      }
      .empty-wrap {
        position: relative;
        height: 200px;
      }
      .logistics-button-group {
        .el-button + .el-button {
          margin-left: 10px;
        }
      }
    }
  }
}
</style>

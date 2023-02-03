<script>
import {
  getOrderImportById,
  getOrderImportAuditList,
  auditOrderImport,
  getOrderImportStatusById,
  updateByBookCarOrderImport
} from '@/api/order/order-import'
import { deleteOrderDeliveryTakeById } from '@/api/order/order-delivery-take'
import { deleteOrderDeliverySendById } from '@/api/order/order-delivery-send'
import { getOrderImportDetail, updatePriceOrderImportDetail } from '@/api/order/order-import-detail'
import { settleOrderSettle, settleCargoOrderSettle, settleProxyOrderSettle } from '@/api/order/order-settle'
import { getSysReportByMenuMarkSysReportConfig } from '@/api/admin/sys-report-config'
import { getSysNo } from '@/api/admin/sys-no'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload, filePrevie } from '@/utils'
import dayjs from '@/utils/day'
import jump from '@/utils/jump'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import Parts from './components/parts'
import EnterFormModifyPrice from './components/enter-form-modify-price'
import EnterFormRateUpdate from './components/enter-form-rate-update'
import EnterFormTake from './components/enter-form-take'
import EnterFormSend from './components/enter-form-send'
import EnterFormDetailsTable from './components/enter-form-details-table'
import { mapGetters } from 'vuex'
import { isFunction, clone } from 'xe-utils'
import BigNumber from '@/utils/big-number'

export default {
  name: 'Details',
  components: { EnterForm, Parts, EnterFormModifyPrice, EnterFormRateUpdate, EnterFormTake, EnterFormSend, EnterFormDetailsTable },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    deleteFn: {
      type: Function,
      default: () => () => {}
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      constant,
      enums,
      loading: false,
      currentConstant: Object.freeze({
        CIF: 'CIF',
        FOB: 'FOB',
        FEE: 'FEE',
        INSUR: 'INSUR',
        OTHER: 'OTHER'
      }),
      form: {
        id: 0,
        auditStatus: '',
        tradeMode: '',
        customerId: 0,
        customerName: '',
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
        declareTitle: '',
        incoterms: '',
        feeInsurRate: 0,
        packageType: '',
        remark: '',

        feeSum: '',
        feeCurr: '',
        feeCurrCode: '',
        feeMark: enums.CUS_MARK_TYPE.getFieldByKey('RATE'),
        feeRate: 0,

        insurSum: '',
        insurCurr: '',
        insurCurrCode: '',
        insurMark: enums.CUS_MARK_TYPE.getFieldByKey('RATE'),
        insurRate: 0,

        otherSum: '',
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
      },
      orderDeliveryTake: {
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
      },
      orderDeliverySend: {
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
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      parts: {
        visible: false,
        row: {}
      },
      modifyPrice: {
        visible: false,
        row: {}
      },
      enterFormDetailsTable: {
        visible: false
      },
      dicts: {},
      createForm: {
        createByName: '',
        createTime: ''
      },
      statusForm: {
        receivingStatus: '',
        shippingStatus: '',
        hiPriceStatus: ''
      },
      updateRate: {
        visible: false,
        row: {}
      },
      takeForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('ADDED'),
        row: {}
      },
      sendForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('ADDED'),
        row: {}
      },
      hiringTaxies: {
        type: 'view',
        loading: false,
        defaultForm: {}
      },
      rightLabelWidth: '70px',
      showPage: false,
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getOrderImportDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ orderId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getOrderImportAuditList(this.tableRow.id),
        save: auditOrderImport
      },
      showBtns: {
        edit: false,
        del: false,
        zdhl: false,
        export: false
      },
      dropdownButtonSettleOptions: [],
      dropdownButtonJumpOptions: [],
      showAuditDetailsBtn: false,
      businessExport: {
        visible: false,
        request: async () => {
          const { data } = await getSysReportByMenuMarkSysReportConfig({ menuMark: constant.PERMISSION_BUS_IMPORT_EXPORT })
          return { data }
        }
      },
      financialStatus: [
        { title: '结算状态', content: '待结算', processStatus: '0' },
        { title: '付款状态', content: '待付款', processStatus: '0' },
        { title: '票据状态', content: '待开票', processStatus: '0' }
      ],
      statusInfoLength: 0,
      setpsOptions: [
        { title: '审价/归类', description: '', processStatus: '' },
        { title: '待入库（境外）', description: '', processStatus: '' },
        { title: '待出库（境外）', description: '', processStatus: '' },
        { title: '待报关', description: '', processStatus: '' },
        { title: '待入库（境内）', description: '', processStatus: '' },
        { title: '待出库（境内）', description: '', processStatus: '' },
        { title: '待签收', description: '', processStatus: '' }
      ]
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_BUS_IMPORT_AUDIT]
    this.dropdownButtonSettleOptions = [
      {
        label: '整单结算',
        visible: this.permissions[constant.PERMISSION_BUS_IMPORT_SETTLE_ZDJS],
        handler: () => this.handleSettleFunc('settle')
      },
      {
        label: '结算货款',
        visible: this.permissions[constant.PERMISSION_BUS_IMPORT_SETTLE_JSHK],
        handler: () => this.handleSettleFunc('settleCargo')
      },
      {
        label: '结算税代费',
        visible: this.permissions[constant.PERMISSION_BUS_IMPORT_SETTLE_JSSDF],
        handler: () => this.handleSettleFunc('settleProxy')
      }
    ]
    this.dropdownButtonJumpOptions = [
      {
        label: '下查归类单',
        visible: this.permissions[constant.PERMISSION_BUS_IMPORT_GL],
        handler: this.jumpClassify
      },
      {
        label: '下查审价单',
        visible: this.permissions[constant.PERMISSION_BUS_IMPORT_SJ],
        handler: this.jumpAppraisalPrice
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.activeName = '订单明细'
        this.loading = true
        this.operateTake = true
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
          getOrderImportById(this.tableRow.id),
          getOrderImportStatusById(this.tableRow.id),
          getSysNo({ seqName: constant.SYS_NO_ORDER_IMPORT })
        ]).then(([dicts, info, statusInfo, sysNos]) => {
          this.statusInfoLength = statusInfo.data.orderStatus.length
          if (statusInfo.data.financeStatus?.length) {
            statusInfo.data.financeStatus.forEach(item => {
              this.financialStatus.forEach(subItem => {
                if (item.title === subItem.title) {
                  subItem.content = item.content
                  subItem.processStatus = item.processStatus
                }
              })
            })
          }
          if (statusInfo.data.orderStatus?.length) {
            const processStatusList = {
              0: 'wait',
              1: 'process',
              2: 'finish',
              3: 'error',
              4: 'success'
            }
            statusInfo.data.orderStatus.forEach((item, index) => {
              this.setpsOptions.forEach((sitem, sindex) => {
                if (index === sindex) {
                  sitem.title = item.title
                  sitem.description = item.content
                  sitem.processStatus = processStatusList[item.processStatus]
                }
              })
            })
          }
          const {
            receivingStatus,
            shippingStatus,
            hiPriceStatus,
            createByName,
            createTime,
            orderDeliveryTakeVOList,
            orderDeliverySendVOList
          } = info.data

          const sysNoImportOrders = sysNos.data.records
          // 这里复用的该方法的逻辑(作用是更新详情页的标题)
          this.handleEnterFormEditSave({
            isCusOrderNoRequired:
              sysNoImportOrders.length > 0 ? sysNoImportOrders[0].status === enums.ENABLE_DISABLE.getFieldByKey('DISABLE') : false,
            cusOrderNo: info.data.cusOrderNo,
            orderNo: info.data.orderNo
          })

          this.dicts = dicts
          this.statusForm = {
            receivingStatus,
            shippingStatus,
            hiPriceStatus
          }
          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(
            this.form,
            {
              feeSum: `${enums.CUS_MARK_TYPE.getFieldByValue(info.data.feeMark)} ${
                info.data.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(info.data.feeRate).times(100).toNumber()
                  : info.data.feeRate
              } ${info.data.feeCurr}`,
              insurSum: `${enums.CUS_MARK_TYPE.getFieldByValue(info.data.insurMark)} ${
                info.data.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(info.data.insurRate).times(100).toNumber()
                  : info.data.feeRate
              } ${info.data.insurCurr}`,
              otherSum: `${enums.CUS_MARK_TYPE.getFieldByValue(info.data.otherMark)} ${
                info.data.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(info.data.otherRate).times(100).toNumber()
                  : info.data.feeRate
              } ${info.data.otherCurr}`
            },
            info.data
          )
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

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_BUS_IMPORT_EDIT],
            del: this.permissions[constant.PERMISSION_BUS_IMPORT_DEL],
            zdhl: this.permissions[constant.PERMISSION_BUS_IMPORT_ZDHL],
            export: this.permissions[constant.PERMISSION_BUS_IMPORT_EXPORT]
          }

          this.columns = this.handleDetailsColumns()
          this.showPage = true

          if (isFunction(cb)) cb()
          this.loading = false
        })
      })
    },
    handleDetailsColumns() {
      return [
        { field: 'productBrand', title: '品牌' },
        { field: 'productName', title: '品名' },
        { field: 'customsName', title: '报关品名' },
        { field: 'productModel', title: '型号' },
        {
          field: 'declareStatus',
          title: '归类状态',
          color: value => {
            return enums.DECLARE_STATUS.getFieldByValue(value, 'color')
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARE_STATUS)
            }
          }
        },
        { field: 'qty', title: '数量', sum: true },
        { field: 'productUnit', title: '单位' },
        { field: 'productOrigin', title: '产地' },
        { field: 'district', title: '境内目的地' },
        { field: 'dest', title: '目的地' },
        {
          field: 'destinationCountry',
          title: '最终目的国(地区)',
          visible: this.form.agentCustomsStatus === enums.WHETHER_STATUS.getFieldByKey('YES')
        },
        {
          field: 'price',
          title: '报关单价',
          align: 'right',
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
          title: '报关总价',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'netWeight',
          title: '净重 ',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'grossWeight',
          title: '毛重 ',
          color: (value, row) => this.verifyRawEqual(value, row, 'netWeight'),
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'volume', title: '体积' },
        {
          field: 'packages',
          title: '件数 ',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'partNo', title: '料号' },
        { field: 'lotNo', title: '批号' },
        {
          field: 'spq',
          title: '包装数量 ',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'dateCode', title: '生产日期' },
        { field: 'declareRemark', title: '客户申报要素' },
        { field: 'customsElement', title: '申报要素' },
        { field: 'remark', title: '备注' }
      ]
    },
    verifyRawEqual(value, row, rawName) {
      // eslint-disable-next-line eqeqeq
      return value < row[rawName] ? '#ff0000' : null
    },
    handleExport() {
      this.businessExport.visible = true
    },
    filePrevie(item) {
      filePrevie({ fileName: item.deliveryFileName, path: item.deliveryFilePath })
    },
    handleParts(rows) {
      if (!rows[0].productModel) return this.$message.error('请选择有型号的记录')
      this.parts = {
        visible: true,
        row: rows[0]
      }
    },
    handleModifyPrice(rows) {
      this.modifyPrice = {
        visible: true,
        row: rows[0]
      }
    },
    async handleModifyPriceSave(form, done) {
      const { id: orderDetailId } = this.modifyPrice.row
      const price = form.price
      const totalMoney = form.totalMoney
      await updatePriceOrderImportDetail({ orderDetailId, price, totalMoney })
      this.detailsReLoad(false)
      this.modifyPrice = {
        visible: false,
        row: {}
      }
      done()
    },
    jumpClassificy(rows) {
      jump(this, 'ClassifyBillImport', { openClassifyBillImportDetails: { orderId: rows[0].id } })
    },
    async handleSettleFunc(type) {
      const params = { orderId: this.tableRow.id, orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT') }
      if (type === 'settle') {
        await settleOrderSettle(params)
      } else if (type === 'settleCargo') {
        await settleCargoOrderSettle(params)
      } else if (type === 'settleProxy') {
        await settleProxyOrderSettle(params)
      }
      this.getDetailsData(() => {
        this.$message.success('操作成功')
      })
    },
    handleRateUpdate() {
      const { id, appointCargoRate, appointTaxRate } = this.form
      this.updateRate.visible = true
      this.updateRate.row = {
        id,
        appointCargoRate,
        appointTaxRate
      }
    },
    handleTakeAdd() {
      this.takeForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED'),
        row: {}
      }
    },
    handleTakeEdit(item) {
      this.takeForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY'),
        row: item
      }
    },
    handleTakeDel(item, index) {
      // 判断是否有id，没有就是新增一行的数据
      if (item.id) {
        this.$confirm('是否确认删除该条记录?')
          .then(() => {
            deleteOrderDeliveryTakeById(item.id).then(() => {
              this.getDetailsData()
              this.$message.success('删除成功')
            })
          })
          .catch(() => {})
      } else {
        this.form.orderDeliveryTakeDTOList.splice(index, 1)
      }
    },
    handleSendAdd() {
      this.sendForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED'),
        row: {}
      }
    },
    handleSendEdit(item) {
      this.sendForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY'),
        row: item
      }
    },
    handleSendDel(item, index) {
      // 判断是否有id，没有就是新增一行的数据
      if (item.id) {
        this.$confirm('是否确认删除该条记录?')
          .then(() => {
            deleteOrderDeliverySendById(item.id).then(() => {
              this.getDetailsData()
              this.$message.success('删除成功')
            })
          })
          .catch(() => {})
      } else {
        this.form.orderDeliverySendDTOList.splice(index, 1)
      }
    },
    jumpClassify() {
      jump(this, 'ClassifyBillImport', { orderNo: this.tableRow.orderNo, filtersMark: true })
    },
    jumpAppraisalPrice() {
      jump(this, 'PriceReviewImport', { orderNo: this.tableRow.orderNo, filtersMark: true })
    },
    handleDetailsTableEdit(rows) {
      if (this.form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')) return
      this.enterFormDetailsTable.visible = true
      this.$refs.enterFormDetailsTableRef.loadData(rows)
      this.$refs.enterFormDetailsTableRef.loadColumns(this.$refs.enterFormRef.handleDetailsColumns())
    },
    handleDblclickDetailsTable({ row }) {
      if (this.form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')) return
      this.enterFormDetailsTable.visible = true
      this.$refs.enterFormDetailsTableRef.loadData([row])
      this.$refs.enterFormDetailsTableRef.loadColumns(this.$refs.enterFormRef.handleDetailsColumns())
    },
    handleDetailsTableSave() {
      this.handleUpdateInfoReload()
    },
    handleEdit() {
      this.enterForm.visible = true
    },
    handleDelete() {
      this.deleteFn()
    },
    handleAuditSave(closeDialog) {
      this.handleUpdateInfoReload(() => {
        closeDialog()
      })
    },
    detailsReLoad(isClearSelect) {
      this.$refs['imortOrderDetailsRef'].refresh(isClearSelect)
    },
    // 修改某一项时，刷新列表页和详情页
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.detailsReLoad()
      this.reLoad(true)
    },
    handleEnterFormEditSave(form) {
      this.$emit('edit-details-title', {
        isCusOrderNoRequired: form.isCusOrderNoRequired,
        cusOrderNo: form.cusOrderNo,
        orderNo: form.orderNo
      })
    },
    handleHiringTaxiesEdit() {
      const { carpoolFlag, trafModeName, trafModeCode, transportDate, endWarehouseId, endWarehouseName, carType, containerNo } = this.form

      this.hiringTaxies = {
        type: 'edit',
        defaultForm: clone(
          {
            carpoolFlag,
            trafModeName,
            trafModeCode,
            transportDate,
            endWarehouseId,
            endWarehouseName,
            carType,
            containerNo
          },
          true
        )
      }
    },
    handleHiringTaxiesSave() {
      this.$set(this.hiringTaxies, 'loading', true)
      updateByBookCarOrderImport(this.form)
        .then(() => {
          this.handleUpdateInfoReload(() => {
            this.$message.success('修改成功')
            this.hiringTaxies = {
              type: 'view',
              loading: false
            }
          })
        })
        .catch(() => {
          this.$set(this.hiringTaxies, 'loading', false)
        })
    },
    handleHiringTaxiesCancel() {
      Object.assign(this.form, this.hiringTaxies.defaultForm)
      this.hiringTaxies.type = 'view'
    },
    handleTakeCondition(value) {
      return [enums.TAKE_DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY'), enums.TAKE_DELIVERY_TYPE.getFieldByKey('TAKE_SELF')].includes(value)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate import-order"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-audit">
          <business-audit-bar
            ref="auditBarRef"
            :audit-status="form.auditStatus"
            :business-id="tableRow.id"
            :request-api="requestApi"
            :show-details="showAuditDetailsBtn"
            @save="handleAuditSave"
          ></business-audit-bar>
        </div>
        <div class="common-operate-l-main">
          <base-form ref="formRef" :model="form" label-width="90px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="客户名称" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      label="客户名称"
                      disabled
                      placeholder=""
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="服务协议" prop="cusContractNo">
                    <business-autocomplete-basic
                      v-model="form.cusContractNo"
                      label="服务协议"
                      disabled
                      placeholder=""
                      :params="{
                        customerId: form.customerId,
                        status: enums.AGREE_STATUS.getFieldByKey('SUCCESS'),
                        tradeMode: [enums.TRADE_MODE.getFieldByKey('IMPORT_AGENT'), enums.TRADE_MODE.getFieldByKey('IMPORT_SELF')].join(',')
                      }"
                      :module-name="constant.AUTOCOMPLETE_KEY_SERVICE_AGREE"
                    >
                      <template v-slot="{ option }">
                        <span>{{ `${option.contractNo} (${option.principalShortName})` }}</span>
                      </template>
                    </business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="贸易模式" prop="tradeMode">
                    <base-select v-model="form.tradeMode" disabled placeholder="" :options="dicts[constant.DICTS_TRADE_MODE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="供应商名称" prop="supplierName">
                    <business-autocomplete-basic
                      v-model="form.supplierName"
                      disabled
                      label="供应商名称"
                      placeholder=""
                      :module-name="constant.AUTOCOMPLETE_KEY_SUPPLIER"
                      :auto-assign="{
                        supplierId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="订单日期" prop="orderDate">
                    <base-date-picker v-model="form.orderDate" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="客户合同号" prop="cusOrderNo">
                    <base-input v-model="form.cusOrderNo" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="报关币别" prop="currencyName">
                    <business-autocomplete-basic
                      v-model="form.currencyName"
                      disabled
                      label="报关币别"
                      placeholder=""
                      :form="form"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="报关总价" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled placeholder="" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="抬头方式" prop="declareTitle">
                    <base-select v-model="form.declareTitle" disabled placeholder="" :options="dicts[constant.DICTS_DECLARE_TITLE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="成交方式" prop="incoterms">
                    <business-autocomplete-ccl
                      v-model="form.incoterms"
                      label="成交方式"
                      disabled
                      placeholder=""
                      :show-more="false"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSACTION_MODE"
                      :form="form"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col v-if="form.incoterms === currentConstant.CIF" :span="6">
                  <base-form-item label="运保费比例" prop="feeInsurRate">
                    <base-input-number v-model="form.feeInsurRate" disabled placeholder="" :precision="4" />
                  </base-form-item>
                </base-col>

                <template v-if="form.incoterms === currentConstant.FOB">
                  <base-col :span="6">
                    <base-form-item label="运费">
                      <base-input v-model="form.feeSum" disabled />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="保险费">
                      <base-input v-model="form.insurSum" disabled />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="杂费">
                      <base-input v-model="form.otherSum" disabled />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col :span="6">
                  <base-form-item label="包装种类" prop="packageType">
                    <business-autocomplete-ccl
                      v-model="form.packageType"
                      label="包装种类"
                      disabled
                      placeholder=""
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_WRAP_TYPE"
                      :form="form"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="业务名称" prop="saleManName">
                    <business-autocomplete-basic
                      v-model="form.saleManName"
                      key-field="userId"
                      disabled
                      label="业务名称"
                      placeholder=""
                      :module-name="constant.AUTOCOMPLETE_KEY_SALEMAN"
                      :auto-assign="{
                        saleManId: 'userId'
                      }"
                      :form="form"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="商务名称" prop="tradeManName">
                    <business-autocomplete-basic
                      v-model="form.tradeManName"
                      key-field="userId"
                      label="商务名称"
                      placeholder=""
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_TRADEMAN"
                      :auto-assign="{
                        tradeManId: 'userId'
                      }"
                      :form="form"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!-- 指定报关信息 -->
            <div class="common-operate-block customs-info">
              <el-collapse class="collapse">
                <el-collapse-item>
                  <template #title>
                    <i class="icon el-icon-s-grid"></i>
                    <span>指定报关信息</span>
                  </template>
                  <div class="content">
                    <base-row :gutter="10">
                      <base-col :span="6">
                        <base-form-item label="境外发货人" prop="overseasShipper">
                          <base-input v-model="form.overseasShipper" disabled placeholder="" />
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="入境口岸" prop="portAddress">
                          <business-autocomplete-ccl
                            v-model="form.portAddress"
                            disabled
                            label="入境口岸"
                            placeholder=""
                            :form="form"
                            :module-name="constant.AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE"
                          ></business-autocomplete-ccl>
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="启运国" prop="portTransport">
                          <business-autocomplete-ccl
                            v-model="form.portTransport"
                            disabled
                            label="启运国"
                            placeholder=""
                            :form="form"
                            :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                          ></business-autocomplete-ccl>
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="经停港" prop="portOfCall">
                          <business-autocomplete-ccl
                            v-model="form.portOfCall"
                            disabled
                            label="经停港"
                            placeholder=""
                            :form="form"
                            :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
                          ></business-autocomplete-ccl>
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="提运单号" prop="waybillNo">
                          <base-input v-model="form.waybillNo" disabled placeholder="" />
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="报关合同号" prop="customsBillNo">
                          <base-input v-model="form.customsBillNo" disabled placeholder="" />
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="申报地海关" prop="customMaster">
                          <business-autocomplete-ccl
                            v-model="form.customMaster"
                            label="申报地海关"
                            disabled
                            placeholder=""
                            :form="form"
                            :module-name="constant.AUTOCOMPLETE_KEY_CCL_CUSTOMS"
                          ></business-autocomplete-ccl>
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="是否委外报关" prop="agentCustomsStatus">
                          <base-select
                            v-model="form.agentCustomsStatus"
                            disabled
                            placeholder=""
                            :clearable="false"
                            :options="dicts[constant.DICTS_WHETHER_STATUS]"
                          />
                        </base-form-item>
                      </base-col>

                      <base-col v-if="form.agentCustomsStatus === enums.WHETHER_STATUS.getFieldByKey('YES')" :span="6">
                        <base-form-item label="报关行" prop="agentCustomsName">
                          <business-autocomplete-basic
                            v-model="form.agentCustomsName"
                            label="报关行"
                            disabled
                            placeholder=""
                            :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMS"
                            :auto-assign="{
                              agentCustomsId: 'id'
                            }"
                            :form="form"
                          />
                        </base-form-item>
                      </base-col>
                    </base-row>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- 订单明细 -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                订单明细
              </span>
              <base-page
                v-if="showPage"
                ref="imortOrderDetailsRef"
                :request="request"
                :columns="columns"
                :tools-config="{
                  setting: {
                    visible: false
                  }
                }"
                :buttons-config="{
                  mores: [
                    {
                      label: '编辑',
                      visible: form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS'),
                      multiple: true,
                      type: 'warning',
                      handler: rows => handleDetailsTableEdit(rows)
                    },
                    {
                      label: '配件列表',
                      visible: true,
                      handler: rows => handleParts(rows)
                    },
                    {
                      label: '修改价格',
                      visible: form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'),
                      handler: rows => handleModifyPrice(rows)
                    },
                    {
                      label: '预归类',
                      visible: true,
                      handler: rows => jumpClassificy(rows)
                    }
                  ]
                }"
                height="380px"
                show-footer
                :name="constant.TABLE_NAME_IMPORT_ORDER_DETAILS"
                @cell-dblclick="handleDblclickDetailsTable"
              />
            </div>

            <!-- 订车信息 -->
            <div class="common-operate-block hiring-taxies">
              <el-collapse class="collapse">
                <el-collapse-item>
                  <template #title>
                    <i class="icon el-icon-s-grid"></i>
                    <span>订车信息</span>
                  </template>
                  <div class="content">
                    <el-button
                      v-if="hiringTaxies.type === 'view' && showBtns.edit && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
                      type="warning"
                      size="mini"
                      @click="handleHiringTaxiesEdit"
                      >编辑</el-button
                    >
                    <template v-if="hiringTaxies.type === 'edit'">
                      <el-button type="primary" size="mini" :loading="hiringTaxies.loading" @click="handleHiringTaxiesSave">保存</el-button>
                      <el-button size="mini" @click="handleHiringTaxiesCancel">取消</el-button>
                    </template>
                    <base-row :gutter="10">
                      <base-col :span="6">
                        <base-form-item label="是否拼车" prop="carpoolFlag">
                          <base-select
                            v-model="form.carpoolFlag"
                            :disabled="hiringTaxies.type === 'view'"
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
                            placeholder="请输入运输方式"
                            :disabled="hiringTaxies.type === 'view'"
                            value-key="name"
                            :auto-assign="{
                              trafModeCode: 'code'
                            }"
                            :form="form"
                            @clear="() => (form.trafModeCode = '')"
                          />
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="运输日期" prop="transportDate">
                          <base-date-picker
                            v-model="form.transportDate"
                            :disabled="hiringTaxies.type === 'view'"
                            placeholder="请选择运输日期"
                          />
                        </base-form-item>
                      </base-col>

                      <base-col v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('LAND')" :span="6">
                        <base-form-item label="订车类型" prop="carType">
                          <base-select
                            v-model="form.carType"
                            placeholder="请选择订车类型"
                            :disabled="hiringTaxies.type === 'view'"
                            :clearable="false"
                            :options="dicts[constant.DICTS_HIRING_TAXIE_TYPE]"
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
                          <base-input v-model="form.containerNo" placeholder="请输入柜号" :disabled="hiringTaxies.type === 'view'" />
                        </base-form-item>
                      </base-col>

                      <base-col :span="6">
                        <base-form-item label="目的仓" prop="endWarehouseName">
                          <business-autocomplete-warehouse
                            v-model="form.endWarehouseName"
                            :disabled="hiringTaxies.type === 'view'"
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
            <div class="common-operate-block">
              <el-collapse class="collapse">
                <el-collapse-item>
                  <template #title>
                    <i class="icon el-icon-s-grid"></i>
                    <span>我司收货信息</span>
                  </template>
                  <div class="content">
                    <div style="padding: 10px 0 0 10px">
                      <el-button type="primary" size="mini" :disabled="false" @click="handleTakeAdd">新增一行</el-button>
                    </div>
                    <div class="delivery-info">
                      <template v-if="form.orderDeliveryTakeDTOList.length">
                        <div v-for="(item, index) in form.orderDeliveryTakeDTOList" :key="item.id" class="delivery-info-item">
                          <div class="delivery-info-main">
                            <!-- 供应商送货 -->
                            <template v-if="item.deliveryType === enums.TAKE_DELIVERY_TYPE.getFieldByKey('SUPPLIER_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                收货方式为<span class="is-extrude">{{ enums.TAKE_DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >， 收货仓库为<span class="is-extrude">{{ item.warehouseName || '-' }}</span
                                >， 仓库地址为<span class="is-extrude">{{ item.takeAddress || '-' }}</span
                                >， 仓库联系人为<span class="is-extrude">{{ item.takePerson || '-' }}</span
                                >， 仓库联系电话为<span class="is-extrude">{{ item.takeMobile || '-' }}</span
                                >，交货时间为<span class="is-extrude">{{ item.takeDate || '-' }}</span
                                >，交货备注为<span class="is-extrude">{{ item.remark || '-' }}</span
                                >。
                              </div>
                            </template>
                            <!-- 调度提货、我司自提 -->
                            <template v-else-if="handleTakeCondition(item.deliveryType)">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                收货方式为<span class="is-extrude">{{ enums.TAKE_DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >， 提货地址为<span class="is-extrude">{{ item.takeAddress || '-' }}</span
                                >， 提货联系人为<span class="is-extrude">{{ item.takePerson || '-' }}</span
                                >， 提货联系电话为<span class="is-extrude">{{ item.takeMobile || '-' }}</span
                                >，交货时间为<span class="is-extrude">{{ item.takeDate || '-' }}</span
                                >，交货备注为<span class="is-extrude">{{ item.remark || '-' }}</span
                                >，提货附件为<span class="is-extrude"
                                  ><el-link type="primary" @click="filePrevie(item)">{{ item.deliveryFileName || '-' }}</el-link></span
                                >。
                              </div>
                            </template>
                            <!-- 快递到货 -->
                            <template v-else-if="item.deliveryType === enums.TAKE_DELIVERY_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                收货方式为<span class="is-extrude">{{ enums.TAKE_DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >， 收货仓库为<span class="is-extrude">{{ item.warehouseName || '-' }}</span
                                >， 仓库地址为<span class="is-extrude">{{ item.takeAddress || '-' }}</span
                                >， 仓库联系人为<span class="is-extrude">{{ item.takePerson || '-' }}</span
                                >， 仓库联系电话为<span class="is-extrude">{{ item.takeMobile || '-' }}</span
                                >， 快递公司为<span class="is-extrude">{{ item.expressName || '-' }}</span
                                >， 快递单号为<span class="is-extrude">{{ item.expressNo || '-' }}</span
                                >，交货时间为<span class="is-extrude">{{ item.takeDate || '-' }}</span
                                >，交货备注为<span class="is-extrude">{{ item.remark || '-' }}</span
                                >。
                              </div>
                            </template>
                          </div>
                          <div class="delivery-info-btns">
                            <el-button
                              type="warning"
                              size="mini"
                              :disabled="false"
                              icon="el-icon-edit"
                              circle
                              @click="handleTakeEdit(item)"
                            ></el-button>
                            <el-button
                              type="danger"
                              size="mini"
                              :disabled="false"
                              icon="el-icon-delete"
                              circle
                              @click="handleTakeDel(item, index)"
                            ></el-button>
                          </div>
                        </div>
                      </template>
                      <base-empty v-else />
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- 客户收货信息 -->
            <div class="common-operate-block">
              <el-collapse class="collapse">
                <el-collapse-item>
                  <template #title>
                    <i class="icon el-icon-s-grid"></i>
                    <span>客户收货信息</span>
                  </template>
                  <div class="content">
                    <div style="padding: 10px 0 0 10px">
                      <el-button type="primary" size="mini" :disabled="false" @click="handleSendAdd">新增一行</el-button>
                    </div>
                    <div class="delivery-info">
                      <template v-if="form.orderDeliverySendDTOList.length">
                        <div v-for="(item, index) in form.orderDeliverySendDTOList" :key="item.id" class="delivery-info-item">
                          <div class="delivery-info-main">
                            <!-- 快递送货 -->
                            <template v-if="item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                送货方式为<span class="is-extrude">{{ enums.DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >， 收货地址为<span class="is-extrude">{{ item.deliveryAddress || '-' }}</span
                                >， 收货公司为<span class="is-extrude">{{ item.deliveryCompany || '-' }}</span
                                >， 收货人为<span class="is-extrude">{{ item.deliveryPerson || '-' }}</span
                                >， 收货电话为<span class="is-extrude">{{ item.deliveryMobile || '-' }}</span
                                >，快递公司为<span class="is-extrude">{{ item.expressName || '-' }}</span
                                >，收货备注为<span class="is-extrude">{{ item.remark || '-' }}</span
                                >。
                              </div>
                            </template>
                            <!-- 调度送货 -->
                            <template v-else-if="item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('SUPPLIER_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                送货方式为<span class="is-extrude">{{ enums.DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >， 收货地址为<span class="is-extrude">{{ item.deliveryAddress || '-' }}</span
                                >， 收货公司为<span class="is-extrude">{{ item.deliveryCompany || '-' }}</span
                                >， 收货人为<span class="is-extrude">{{ item.deliveryPerson || '-' }}</span
                                >， 收货电话为<span class="is-extrude">{{ item.deliveryMobile || '-' }}</span
                                >，收货备注为<span class="is-extrude">{{ item.remark || '-' }}</span
                                >。
                              </div>
                            </template>

                            <!-- 客户自提 -->
                            <template v-else-if="item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                送货方式为<span class="is-extrude">{{ enums.DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >， 提货人为<span class="is-extrude">{{ item.takePerson || '-' }}</span
                                >， 提货电话为<span class="is-extrude">{{ item.deliveryMobile || '-' }}</span
                                >， 提货人身份证为<span class="is-extrude">{{ item.deliveryIdCard || '-' }}</span
                                >， 提货附件为<span class="is-extrude"
                                  ><el-link type="primary" @click="filePrevie(item)">{{ item.deliveryFileName || '-' }}</el-link></span
                                >。
                              </div>
                            </template>
                          </div>
                          <div class="delivery-info-btns">
                            <el-button
                              type="warning"
                              size="mini"
                              :disabled="false"
                              icon="el-icon-edit"
                              circle
                              @click="handleSendEdit(item)"
                            ></el-button>
                            <el-button
                              type="danger"
                              size="mini"
                              :disabled="false"
                              icon="el-icon-delete"
                              circle
                              @click="handleSendDel(item, index)"
                            ></el-button>
                          </div>
                        </div>
                      </template>
                      <base-empty v-else />
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">订单状态</el-divider>
          <business-steps-list :options="setpsOptions" direction="vertical" :active="statusInfoLength - 1"></business-steps-list>
        </div>

        <div class="common-operate-r-block">
          <el-divider content-position="left">财务状态</el-divider>

          <div v-for="(item, index) in financialStatus" :key="index" class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">{{ item.title }}:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.ORDER_PROCESS_STATUS.getFieldByValue(item.processStatus, 'color') }">
              {{ item.content }}
            </div>
          </div>
        </div>
        <div class="common-operate-r-block">
          <el-divider content-position="left">创建信息</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">创建人:</div>
            <div class="dcommon-etails-r-value">{{ createForm.createByName }}</div>
          </div>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">创建时间:</div>
            <div class="common-operate-r-value">{{ createForm.createTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-operate-b">
      <div class="common-operate-b-wrap">
        <business-dropdown-button :options="dropdownButtonSettleOptions">结算操作</business-dropdown-button>
        <business-dropdown-button type="success" :options="dropdownButtonJumpOptions">下查单据</business-dropdown-button>
        <el-button v-if="showBtns.export" icon="el-icon-download" type="info" @click="handleExport">导出</el-button>
        <el-button v-if="showBtns.zdhl" :disabled="loading" icon="el-icon-s-operation" type="primary" @click="handleRateUpdate"
          >指定汇率</el-button
        >
        <el-button
          v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-delete"
          type="danger"
          @click="handleDelete"
          >删除</el-button
        >
        <el-button
          v-if="showBtns.edit && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-edit"
          type="warning"
          @click="handleEdit"
          >编辑</el-button
        >
      </div>
    </div>
    <business-export v-model="businessExport.visible" :request="businessExport.request" :table-rows="[form]" />
    <enter-form
      ref="enterFormRef"
      v-model="enterForm.visible"
      :type="enterForm.type"
      :table-row="{ id: tableRow.id }"
      :re-load="handleUpdateInfoReload"
      @edit-save="handleEnterFormEditSave"
    />
    <parts v-model="parts.visible" disabled :main-row="parts.row" />
    <enter-form-modify-price v-model="modifyPrice.visible" :table-row="modifyPrice.row" @save="handleModifyPriceSave" />
    <enter-form-rate-update
      v-model="updateRate.visible"
      :table-row="updateRate.row"
      :re-load="handleUpdateInfoReload"
    ></enter-form-rate-update>
    <enter-form-take
      v-model="takeForm.visible"
      :type="takeForm.type"
      :table-row="takeForm.row"
      :main-form="form"
      :re-load="handleUpdateInfoReload"
    ></enter-form-take>
    <enter-form-send
      v-model="sendForm.visible"
      :type="sendForm.type"
      :table-row="sendForm.row"
      :main-form="form"
      :re-load="handleUpdateInfoReload"
    ></enter-form-send>
    <enter-form-details-table
      ref="enterFormDetailsTableRef"
      v-model="enterFormDetailsTable.visible"
      :order-id="form.id"
      @details-table-save="handleDetailsTableSave"
    />
  </div>
</template>

<style lang="scss" scoped>
.import-order {
  .common-operate-l {
    overflow: inherit;
    width: calc(100% - 240px);
    &-audit {
      padding: 10px 10px 0 10px;
    }
    &-main {
      overflow: auto;
    }
  }
  .common-operate-block {
    &.is-special {
      .common-operate-block-header {
        margin-bottom: 0;
      }
    }
    &.customs-info {
      .el-collapse-item__content {
        .content {
          padding-top: 16px;
        }
      }
    }
    &.hiring-taxies {
      .el-collapse-item__content {
        .content {
          padding: 10px 10px 0;
          .el-row {
            padding: 6px 0 0;
          }
        }
      }
    }
  }
  .collapse {
    ::v-deep .el-collapse-item__header {
      padding-left: 20px;
      height: 42px;
      font-size: 14px;
      font-weight: 400;
      border-bottom: 1px solid #eeeeee;
      color: #000000;
      line-height: 42px;
      &.focusing:focus:not(:hover) {
        color: #000000;
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
    ::v-deep .el-collapse-item__content {
      padding-bottom: 3px;
      .content {
        height: 100%;
      }
    }
  }
  .delivery-info {
    padding: 0 10px 10px;
    &-item {
      display: flex;
      align-items: center;
      padding-top: 10px;
      font-size: 14px;
      &:first-child {
        padding-bottom: 0;
      }
      .is-extrude {
        padding-left: 5px;
        color: var(--color-primary);
      }
    }
    &-seq {
      display: inline-block;
      margin-right: 5px;
      padding: 4px 10px;
      font-size: 12px;
      border: 1px solid #dcdfe6;
      border-radius: 50%;
      background: #ffffff;
    }
    &-main {
      display: flex;
      align-items: center;
      flex: 1;
    }
    &-btns {
      padding-right: 5px;
      padding-left: 5px;
      width: 90px;
    }
    &-content {
      flex: 1;
    }
  }
}
</style>

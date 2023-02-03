<script>
import { getOrderSaleById, saveOrderSale, updateOrderSale } from '@/api/order/order-sale'
import { orderSaleDetailImportUrl, orderSaleDetailExportUrl } from '@/api/order/order-sale-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { filePrevie } from '@/utils'
import { clone } from 'xe-utils'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'
import DetailsCreate from './details-create'

const form = {
  id: 0,
  agentOrderId: 0,
  agentOrderNo: '',
  customerId: 0,
  customerName: '',
  saleManName: '',
  saleManId: 0,
  tradeManName: '',
  tradeManId: 0,
  orderDate: dayjs().format('YYYY-MM-DD'),
  currencyName: '人民币',
  principalId: 0,
  principalName: '',
  settleCurrencyName: '',
  totalMoney: 0,
  saleProfit: 0,
  remark: '',

  orderDeliverySendDTOList: []
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
    return {
      enums,
      constant,
      orderSaleDetailImportUrl,
      downloadConfig: {
        url: orderSaleDetailExportUrl,
        params: {},
        fileName: '货代订单模板'
      },
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        customerName: [{ required: true, message: '客户名称必填' }],
        orderDate: [{ required: true, message: '订单日期必填' }],
        currencyName: [{ required: true, message: '销售币别必填' }],
        saleManName: [{ required: true, message: '业务名称必填' }],
        tradeManName: [{ required: true, message: '商务名称必填' }]
      },
      dicts: {},
      copyOrder: {
        enable: false,
        row: {},
        isCopyDetails: false
      },
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
        const { DICTS_DELIVERY_TYPE, DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_DELIVERY_TYPE, DICTS_WHETHER_STATUS]),
          type && getOrderSaleById(this.tableRow.id),
          // 复制订单拿到的id先去请求详情获取数据
          this.copyOrder.enable && getOrderSaleById(this.copyOrder.row.id),
          this.getDetailsEditTableInstance().loadColumns(this.handleDetailsColumns())
        ]).then(([dicts, info, copyInfo]) => {
          this.dicts = dicts
          if (type) {
            this.handleDataAssemble(info.data, true)
          }
          if (this.copyOrder.enable) {
            this.handleDataAssemble(copyInfo.data, this.copyOrder.isCopyDetails, 'copyOrder')
          }
        })
      })
    },
    handleDataAssemble(info, isDetails, type) {
      const { orderSaleDetailVOList, orderDeliverySendVOList } = info
      Object.assign(
        this.form,
        info,
        // 复制过来的订单对下面的字段清空操作
        type === 'copyOrder'
          ? {
              id: void 0,
              // 不复制订单明细的时候, 销售总价直接赋值为0
              totalMoney: isDetails ? this.form.totalMoney : 0
            }
          : {}
      )
      if (isDetails) {
        this.getDetailsEditTableInstance().loadData(
          (orderSaleDetailVOList || []).map(record => ({
            ...record,
            id: type === 'copyOrder' ? 0 : record.id,
            orderId: type === 'copyOrder' ? 0 : record.orderId
          })),
          'cover'
        )
      }
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
      const { id, tradeManName, tradeManId, companyName } = rows[0]

      this.customerObj = rows[0]
      Object.assign(this.form, {
        tradeManName,
        tradeManId,
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
    handleAgentOrderNoSelect(rows) {
      const { id } = rows[0]
      this.form.agentOrderId = id
      this.getDetailsEditTableInstance().loadData([], 'cover')
    },
    handleAgentOrderNoClear() {
      this.form.agentOrderId = 0
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
    /** 列数据 */
    handleDetailsColumns() {
      return [
        { field: 'productModel', width: 120, title: '型号' },
        { field: 'productBrand', width: 120, title: '品牌' },
        { field: 'productOrigin', width: 120, title: '产地' },
        { field: 'productName', width: 120, title: '品名' },
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
          },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'qty')
          }
        },
        {
          field: 'purchasePrice',
          width: 120,
          title: '采购单价',
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
          field: 'totalPurchaseMoney',
          width: 120,
          title: '采购总价',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'price',
          width: 120,
          title: '销售单价',
          type: 'inputNumber',
          rules: [{ required: true, message: '销售单价必填' }],
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
          title: '销售总价',
          type: 'inputNumber',
          rules: [{ required: true, message: '销售总价必填' }],
          sum: true,
          attrs: {
            precision: 2
          },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'totalMoney')
          }
        },

        {
          field: 'saleProfit',
          title: '销售利润',
          width: 100,
          sum: true,
          formatter: {
            type: 'number'
          }
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

      /* 销售利润 = 销售总价 - 采购总价 */
      row.saleProfit = new BigNumber(row.totalMoney).minus(row.totalPurchaseMoney).toNumber()

      this.calcTotalMoney()
    },
    calcTotalMoney() {
      const tableData = this.getDetailsEditTableInstance().getRecords()
      this.form.totalMoney = tableData.reduce((total, row) => {
        return new BigNumber(total)
          .plus(row.totalMoney || 0)
          .dp(2)
          .toNumber()
      }, 0)

      this.form.saleProfit = tableData.reduce((saleProfit, row) => {
        return new BigNumber(saleProfit)
          .plus(row.saleProfit || 0)
          .dp(2)
          .toNumber()
      }, 0)
    },
    handleTableDelete() {
      this.calcTotalMoney()
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
    handleImportResult(res, status, done) {
      if (status === 'success') {
        if (res.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
          this.$nextTick(async () => {
            const orderImportDetailVOList = res.data || []
            this.getDetailsEditTableInstance().clearSelectRows()
            await this.getDetailsEditTableInstance().loadData(orderImportDetailVOList, 'cover')
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
    handleCreate() {
      if (this.form.agentOrderNo === '') return this.$message.warning('请先选择代销订单号')
      this.detailsCreate = {
        visible: true,
        params: {
          orderId: this.form.agentOrderId
        }
      }
    },
    async handleDetailsCreateSave(data, done) {
      data.forEach(v => {
        v.agentOrderDetailId = v.id
        v.purchasePrice = v.price
        v.totalPurchaseMoney = v.totalMoney
        v.price = 0
        v.totalMoney = 0
        v.qty = new BigNumber(Number(v.qty)).minus(Number(v.saleQty)).dp(2).toNumber()
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
              return this.$message.error(`订单明细: 第${rowIndex}行 ${rule.message}`)
            }
            const orderSaleDetailDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign({ orderSaleDetailDTOList }, this.form)
            formData.settleCurrencyName = formData.currencyName
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveOrderSale(formData)
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
              updateOrderSale(formData)
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
      return this.$refs.orderDetailsEditTableRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="98%"
    custom-class="common-form-dialog sale-order-dialog"
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
            <base-form-item label="代销订单号" prop="agentOrderNo">
              <business-autocomplete-basic
                v-model="form.agentOrderNo"
                label="代销订单号"
                placeholder="请输入代销订单号"
                :params="{
                  auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS')
                }"
                :module-name="constant.AUTOCOMPLETE_KEY_AGENT_SALE_ORDER"
                @select="handleAgentOrderNoSelect"
                @clear="handleAgentOrderNoClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="订单日期" prop="orderDate">
              <base-date-picker v-model="form.orderDate" placeholder="请输入订单日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="销售币别" prop="currencyName">
              <business-autocomplete-basic
                v-model="form.currencyName"
                label="销售币别"
                placeholder="请输入销售币别"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="采购主体" prop="principalName">
              <business-autocomplete-basic
                v-model="form.principalName"
                label="采购主体"
                :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                placeholder="请输入采购主体"
                :auto-assign="{
                  principalId: 'id'
                }"
                :form="form"
                @clear="() => (form.principalId = 0)"
              ></business-autocomplete-basic>
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
            <base-form-item label="销售总价" prop="totalMoney">
              <base-input-number v-model="form.totalMoney" readonly placeholder="请输入销售总价" :precision="2" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="销售利润" prop="saleProfit">
              <base-input-number v-model="form.saleProfit" readonly placeholder="请输入销售利润" :precision="2" />
            </base-form-item>
          </base-col>

          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
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
          :show-added="false"
          :name="constant.TABLE_NAME_SALE_ORDER_ENTER"
          @delete="handleTableDelete"
        >
          <template v-slot:buttons="{ selectRecords }">
            <el-button size="mini" type="primary" @click="handleCreate(selectRecords)">生成</el-button>
            <business-import-button :action="orderSaleDetailImportUrl" :download-config="downloadConfig" @result="handleImportResult" />
          </template>
        </base-edit-table>
        <details-create
          v-model="detailsCreate.visible"
          :params="detailsCreate.params"
          :parent-details-table-instance="getDetailsEditTableInstance"
          @save="handleDetailsCreateSave"
        ></details-create>
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
                                  fileModule: constant.FILE_MODULE_SALE_ORDER_SEND_DELIBERY,
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
  </base-dialog>
</template>

<style lang="scss">
.sale-order-dialog {
  .common-form-block {
    &.is-special {
      box-sizing: border-box;
      padding-bottom: 10px;
      .common-form-block-header {
        margin-bottom: 10px;
      }
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

<script>
import { getOrderAgentSaleById, saveOrderAgentSale, updateOrderAgentSale } from '@/api/order/order-agent-sale'
import { orderAgentSaleDetailImportUrl, orderAgentSaleDetailExportUrl } from '@/api/order/order-agent-sale-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { filePrevie } from '@/utils'
import { clone } from 'xe-utils'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  id: 0,
  customerId: 0,
  customerName: '',
  cusContractId: 0,
  cusContractNo: '',
  cusOrderNo: '',
  tradeManName: '',
  tradeManId: 0,
  saleManName: '',
  saleManId: 0,
  orderDate: dayjs().format('YYYY-MM-DD'),
  currencyName: '',
  settleCurrencyName: '',
  totalMoney: 0,
  remark: '',

  orderDeliveryTakeDTOList: []
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

export default {
  name: 'EnterForm',
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
      orderAgentSaleDetailImportUrl,
      downloadConfig: {
        url: orderAgentSaleDetailExportUrl,
        params: {},
        fileName: '代销订单模板'
      },
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        customerName: [{ required: true, message: '客户名称必填' }],
        cusContractNo: [{ required: true, message: '服务协议必填' }],
        orderDate: [{ required: true, message: '订单日期必填' }],
        currencyName: [{ required: true, message: '采购币别必填' }],
        saleManName: [{ required: true, message: '业务名称必填' }],
        tradeManName: [{ required: true, message: '商务名称必填' }]
      },
      dicts: {},
      copyOrder: {
        enable: false,
        row: {},
        isCopyDetails: false
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
        const { DICTS_TAKE_DELIVERY_TYPE, DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_TAKE_DELIVERY_TYPE, DICTS_WHETHER_STATUS]),
          type && getOrderAgentSaleById(this.tableRow.id),
          // 复制订单拿到的id先去请求详情获取数据
          this.copyOrder.enable && getOrderAgentSaleById(this.copyOrder.row.id),
          this.$refs.orderDetailsEditTableRef.loadColumns(this.handleDetailsColumns())
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
      const { orderAgentSaleDetailVOList, orderDeliveryTakeVOList } = info
      Object.assign(
        this.form,
        info,
        // 复制过来的订单对下面的字段清空操作
        type === 'copyOrder'
          ? {
              id: void 0,
              cusOrderNo: '',
              // 不复制订单明细的时候, 采购总价直接赋值为0
              totalMoney: isDetails ? this.form.totalMoney : 0
            }
          : {}
      )
      if (isDetails) {
        this.$refs.orderDetailsEditTableRef.loadData(
          (orderAgentSaleDetailVOList || []).map(record => ({
            ...record,
            id: type === 'copyOrder' ? 0 : record.id,
            orderId: type === 'copyOrder' ? 0 : record.orderId
          })),
          'cover'
        )
      }
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
    /** 明细列数据 */
    handleDetailsColumns() {
      const validProductModelAndProductName = ({ row }) => {
        if (!row.productName && !row.productModel) {
          return new Error('品名和型号必填其中一个')
        }
      }
      return [
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
          rules: [{ required: true, message: '产地必填' }],
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
          field: 'productName',
          width: 120,
          title: '品名',
          rules: [{ validator: validProductModelAndProductName }],
          type: 'input'
        },

        {
          field: 'productUnit',
          title: '单位',
          width: 150,
          rules: [{ required: true, message: '单位必填' }],
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
          },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'qty')
          }
        },
        {
          field: 'price',
          width: 120,
          title: '采购单价',
          type: 'inputNumber',
          rules: [{ required: true, message: '采购单价必填' }],
          sum: true,
          attrs: {
            precision: 6
          },
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          },
          footerConfig: { precision: 6 },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'price')
          }
        },
        {
          field: 'totalMoney',
          width: 120,
          title: '采购总价',
          type: 'inputNumber',
          rules: [{ required: true, message: '采购总价必填' }],
          sum: true,
          attrs: {
            precision: 2
          },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'totalMoney')
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
      this.calcTotalMoney()
    },
    calcTotalMoney() {
      const tableData = this.$refs.orderDetailsEditTableRef.getRecords()
      this.form.totalMoney = tableData.reduce((total, row) => {
        return new BigNumber(total)
          .plus(row.totalMoney || 0)
          .dp(2)
          .toNumber()
      }, 0)
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
      if (this.handleTakeCondition(this.form.deliveryType)) {
        const { person, mobile } = rows[0]
        item.takePerson = person
        item.takeMobile = mobile
      } else {
        const { person, mobile, phone } = rows[0]
        if (!this.handleTakeCondition(this.form.deliveryType)) {
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
            const orderAgentSaleDetailDTOList = this.$refs.orderDetailsEditTableRef.getRecords()
            const formData = Object.assign({ orderAgentSaleDetailDTOList }, this.form)
            formData.settleCurrencyName = formData.currencyName
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveOrderAgentSale(formData)
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
              updateOrderAgentSale(formData)
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
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="98%"
    custom-class="common-form-dialog agent-sale-order-dialog"
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
            <base-form-item label="服务协议" prop="cusContractNo">
              <business-autocomplete-basic
                v-model="form.cusContractNo"
                label="服务协议"
                placeholder="请输入服务协议"
                :params="{
                  customerId: form.customerId,
                  status: enums.AGREE_STATUS.getFieldByKey('SUCCESS'),
                  tradeMode: enums.TRADE_MODE.getFieldByKey('SALES_AGENT')
                }"
                :module-name="constant.AUTOCOMPLETE_KEY_SERVICE_AGREE"
                :auto-assign="{
                  cusContractId: 'id'
                }"
                :form="form"
                @clear="() => (form.cusContractId = 0)"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="订单日期" prop="orderDate">
              <base-date-picker v-model="form.orderDate" placeholder="请输入订单日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="客户订单号" prop="cusOrderNo">
              <base-input v-model="form.cusOrderNo" placeholder="请输入客户订单号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="采购币别" prop="currencyName">
              <business-autocomplete-basic
                v-model="form.currencyName"
                label="采购币别"
                placeholder="请输入采购币别"
                :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="采购总价" prop="totalMoney">
              <base-input-number v-model="form.totalMoney" readonly placeholder="请输入采购总价" :precision="2" />
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
          :name="constant.TABLE_NAME_BUS_CONSIGN_ENTER"
          @delete="handleTableDelete"
        >
          <template v-slot:buttons>
            <business-import-button
              :action="orderAgentSaleDetailImportUrl"
              :download-config="downloadConfig"
              @result="handleImportResult"
            />
          </template>
        </base-edit-table>
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
                                fileModule: constant.FILE_MODULE_AGENT_SALE_ORDER_TAKE_DELIBERY,
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
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.agent-sale-order-dialog {
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

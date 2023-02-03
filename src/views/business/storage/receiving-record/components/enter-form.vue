<script>
import { getWareReceiptRecordById, saveWareReceiptRecord, updateWareReceiptRecord } from '@/api/warehouse/ware-receipt-record'
import { getFile } from '@/api/admin/sys-file'
import { getDataDictionary } from '@/api/admin/dicts'
import { filePrevie } from '@/utils'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  receiptDate: '',
  deliveryType: '',
  companyId: 0,
  companyName: '',
  warehouseId: 0,
  warehouseName: '',
  location: '',
  expressName: '',
  expressNo: '',
  orderType: '',
  orderId: 0,
  orderNo: '',
  remark: '',
  fileList: []
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
    // 当前表格选中的行数据
    mainRow: {
      type: Object,
      default: () => ({})
    },
    // 如果是tab栏下的收货记录，这个参数是主表的行数据
    tableRow: {
      type: Object,
      default: () => ({})
    },
    detailsMark: Boolean,
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        receiptDate: [{ required: true, message: '收货时间必填' }],
        companyName: [{ required: true, message: '送货商必填' }],
        warehouseName: [{ required: true, message: '收货仓库必填' }],
        deliveryType: [{ required: true, message: '收货方式必填' }]
      },
      dicts: {},
      orderTypes: []
    }
  },
  computed: {
    orderModuleName() {
      let moduleName = constant.AUTOCOMPLETE_KEY_IMPORT_ORDER
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
        this.form = clone(form, true)
        const { DICTS_RECEIVE_ORDER_TYPE, DICTS_RECEIVE_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_RECEIVE_ORDER_TYPE, DICTS_RECEIVE_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getWareReceiptRecordById(this.mainRow.id),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') &&
            getFile({ size: -1, fileModule: constant.FILE_MODULE_WARE_RECEIPT_RECORD, recordId: this.mainRow.id })
        ]).then(([dicts, info, files]) => {
          this.dicts = dicts
          // TODO 处理一下 orderTypes 目前先只能选进口订单(0)、出口订单(1)、代采订单(2)、代销订单(3)和无单入库(9)
          this.orderTypes = this.dicts[DICTS_RECEIVE_ORDER_TYPE].filter(v =>
            [
              enums.ORDER_TYPE.getFieldByKey('IMPORT'),
              enums.ORDER_TYPE.getFieldByKey('EXPORT'),
              enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'),
              enums.ORDER_TYPE.getFieldByKey('AGENT_SALE'),
              enums.ORDER_TYPE.getFieldByKey('STORAGE')
            ].includes(v.value)
          )

          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
            this.form.fileList = files.data.records.map(v => ({ id: v.id, name: v.original, url: `/${v.bucketName}/${v.fileName}` }))
          } else {
            let obj = {}
            if (this.detailsMark) {
              const { id: orderId, tradeMode, orderNo, orderType } = this.tableRow
              // 仓储订单没有贸易模式
              if (orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
                obj = { orderType: enums.ORDER_TYPE.getFieldByKey('STORAGE'), orderNo, orderId }
              } else {
                obj = { orderType: this.tradeModeToWareOrderType(tradeMode), orderNo, orderId }
              }
            }
            Object.assign(this.form, obj)
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
    handleOrderTypeChange() {
      Object.assign(this.form, {
        orderNo: '',
        orderId: 0
      })
    },
    tradeModeToWareOrderType(tradeMode) {
      const map = {
        [enums.ORDER_TYPE.getFieldByKey('IMPORT')]: [
          enums.TRADE_MODE.getFieldByKey('IMPORT_AGENT'),
          enums.TRADE_MODE.getFieldByKey('IMPORT_SELF')
        ],
        [enums.ORDER_TYPE.getFieldByKey('EXPORT')]: [
          enums.TRADE_MODE.getFieldByKey('EXPORT_AGENT'),
          enums.TRADE_MODE.getFieldByKey('EXPORT_SELF')
        ],
        [enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')]: [enums.TRADE_MODE.getFieldByKey('PURCHASE_AGENT')],
        [enums.ORDER_TYPE.getFieldByKey('AGENT_SALE')]: [enums.TRADE_MODE.getFieldByKey('SALES_AGENT')]
      }
      let orderType = ''
      for (const k in map) {
        if (Object.hasOwnProperty.call(map, k)) {
          if (Array.isArray(map[k])) {
            if (map[k].some(v => v === tradeMode)) {
              orderType = k
              break
            }
          }
        }
      }
      return orderType
    },
    handleFilePreview(file) {
      filePrevie({ fileName: file.name, path: file.response ? file.response.data.url : file.url })
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const files = this.$refs.uploadRef.getInstance().uploadFiles
          const formData = clone(this.form, true)
          formData.fileIds = files.map(v => {
            return v.response ? v.response.data.id : v.id
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveWareReceiptRecord(formData)
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
            updateWareReceiptRecord(formData)
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
    width="800px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="12">
          <base-form-item label="订单类型" prop="orderType">
            <base-select v-model="form.orderType" placeholder="请选择订单类型" :options="orderTypes" @change="handleOrderTypeChange" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="订单编号" prop="orderNo">
            <business-autocomplete-basic
              v-model="form.orderNo"
              label="订单编号"
              :disabled="detailsMark || form.orderType === ''"
              placeholder="请输入订单编号"
              :params="{
                auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS'),
                receivingStatus: [
                  enums.RECEIVING_STATUS.getFieldByKey('WAIT'),
                  enums.RECEIVING_STATUS.getFieldByKey('PART'),
                  enums.RECEIVING_STATUS.getFieldByKey('ERROR')
                ].join(',')
              }"
              :auto-assign="{ orderId: 'id' }"
              :form="form"
              :module-name="orderModuleName"
              @clear="() => (form.orderId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="收货时间" prop="receiptDate">
            <base-date-picker
              v-model="form.receiptDate"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择收货时间"
            />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="送货商" prop="companyName">
            <business-autocomplete-basic
              v-model="form.companyName"
              label="送货商"
              placeholder="请输入送货商"
              :params="{
                // 判断企业是否为客户或供应商(1: 查询客户或供应商)
                cusAndSupFlag: enums.WHETHER_STATUS.getFieldByKey('YES')
              }"
              :auto-assign="{ companyId: 'id' }"
              :form="form"
              :module-name="constant.AUTOCOMPLETE_KEY_COMPANY"
              @clear="() => (form.companyId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="收货仓库" prop="warehouseName">
            <business-autocomplete-warehouse
              v-model="form.warehouseName"
              value-key="warehouseName"
              label="收货仓库"
              placeholder="请输入收货仓库"
              :auto-assign="{
                warehouseId: 'id'
              }"
              :form="form"
              @clear="() => (form.warehouseId = 0)"
            ></business-autocomplete-warehouse>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="收货库位" prop="location">
            <base-input v-model="form.location" placeholder="请输入收货库位" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="收货方式" prop="deliveryType">
            <base-select v-model="form.deliveryType" placeholder="请选择收货方式" :options="dicts[constant.DICTS_RECEIVE_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col v-if="form.deliveryType === enums.RECEIVE_TYPE.getFieldByKey('EXPRESS_DELIVERY')" :span="12">
          <base-form-item label="快递服务商" prop="expressName">
            <base-input v-model="form.expressName" placeholder="请输入快递服务商" />
          </base-form-item>
        </base-col>

        <base-col v-if="form.deliveryType === enums.RECEIVE_TYPE.getFieldByKey('EXPRESS_DELIVERY')" :span="12">
          <base-form-item label="快递单号" prop="expressNo">
            <base-input v-model="form.expressNo" placeholder="请输入快递单号" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="备注" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="提货附件">
            <base-upload
              ref="uploadRef"
              :file-list="form.fileList"
              multiple
              :data="{
                fileModule: constant.FILE_MODULE_WARE_RECEIPT_RECORD,
                recordId: 0,
                fileType: '普通附件'
              }"
              :on-preview="handleFilePreview"
            ></base-upload>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

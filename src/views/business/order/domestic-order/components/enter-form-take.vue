<script>
import { saveOrderDeliveryTake, updateOrderDeliveryTake } from '@/api/order/order-delivery-take'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { filePrevie } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
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
  name: 'EnterForTake',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    mainForm: Object,
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
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_TAKE_DELIVERY_TYPE } = constant
        Promise.all([getDataDictionary([DICTS_TAKE_DELIVERY_TYPE])]).then(([dicts]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, this.tableRow)
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
    handleTakeDeliveryChange() {
      Object.assign(this.form, {
        warehouseName: '',
        warehouseId: 0,
        deliveryFilePath: '',
        deliveryFileId: 0,
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
      })
    },
    handleWarehouseSelect(rows) {
      const { id, warehouseName, warehouseAddress, person, mobile, phone } = rows[0]
      this.form.warehouseId = id
      this.form.warehouseName = warehouseName
      /* 收货方式不为调度提货、我司自提, 从收货仓库带值 */
      if (!this.handleTakeCondition(this.form.deliveryType)) {
        this.form.takeAddress = warehouseAddress
        this.form.takePerson = person
        this.form.takeMobile = mobile && !phone ? mobile : !mobile && phone ? phone : mobile && phone ? `${mobile}/${phone}` : ''
      }
    },
    handleTakeAddressSelect(rows) {
      if (this.handleTakeCondition(this.form.deliveryType)) {
        const { person, mobile } = rows[0]
        this.form.takePerson = person
        this.form.takeMobile = mobile
      } else {
        const { person, mobile, phone } = rows[0]
        if (!this.handleTakeCondition(this.form.deliveryType)) {
          this.form.takePerson = person
          this.form.takeMobile = mobile && !phone ? mobile : !mobile && phone ? phone : mobile && phone ? `${mobile}/${phone}` : ''
        }
      }
    },
    takeUploadSuccess(response, file, fileList) {
      if (response.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
        this.form.deliveryFilePath = response.data.url
        this.form.deliveryFileId = response.data.id
        this.form.deliveryFileName = file.name
        this.form.fileList = fileList
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
        const formData = Object.assign(
          {
            orderId: this.mainForm.id,
            orderType: enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')
          },
          this.form
        )
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveOrderDeliveryTake(formData)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}成功`)
                this.visible = false
                done()
                this.reLoad()
              })
              .catch(() => {
                done()
              })
          } else {
            updateOrderDeliveryTake(formData)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}成功`)
                this.visible = false
                done()
                this.reLoad()
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
    width="500px"
    :title="`我司收货信息${
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    }`"
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" label-width="90px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="收货方式" prop="deliveryType">
            <base-select
              v-model="form.deliveryType"
              placeholder="请选择收货方式"
              :options="dicts[constant.DICTS_TAKE_DELIVERY_TYPE]"
              @change="handleTakeDeliveryChange"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="收货仓库" prop="warehouseName">
            <business-autocomplete-basic
              v-model="form.warehouseName"
              label="收货仓库"
              placeholder="请输入收货仓库"
              :module-name="constant.AUTOCOMPLETE_KEY_WAREHOUSE"
              :params="{ status: enums.ENABLE_DISABLE.getFieldByKey('ENABLED') }"
              @select="handleWarehouseSelect"
              @clear="() => (form.warehouseId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="提货地址" prop="takeAddress">
            <base-input v-if="!handleTakeCondition(form.deliveryType)" v-model="form.takeAddress" placeholder="请输入仓库地址" />
            <template v-else>
              <business-autocomplete-basic
                v-model="form.takeAddress"
                label="提货地址"
                placeholder="请输入提货地址"
                :is-exist="false"
                :module-name="constant.AUTOCOMPLETE_KEY_CUS_DELIVERY"
                :params="{ customerId: '0', addressType: enums.ADDRESS_TYPE.getFieldByKey('PICKUP') }"
                @select="handleTakeAddressSelect"
              ></business-autocomplete-basic>
            </template>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item :label="`${handleTakeCondition(form.deliveryType) ? '提货' : '仓库'}联系人`" prop="takePerson">
            <base-input v-model="form.takePerson" :placeholder="`请输入${handleTakeCondition(form.deliveryType) ? '提货' : '仓库'}人`" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item :label="`${handleTakeCondition(form.deliveryType) ? '提货' : '仓库'}联系电话`" prop="takeMobile">
            <base-input
              v-model="form.takeMobile"
              :placeholder="`请输入${handleTakeCondition(form.deliveryType) ? '提货' : '仓库'}联系电话`"
            />
          </base-form-item>
        </base-col>

        <!-- 收货方式为调度提货 -->
        <base-col v-if="handleTakeCondition(form.deliveryType)" :span="24">
          <base-form-item label="提货附件">
            <base-upload
              is-upload-only-one-file
              :file-list="form.fileList"
              :on-preview="handleFilePreview"
              :data="{
                fileModule: constant.FILE_MODULE_AGENT_PURCHASE_ORDER_TAKE_DELIBERY,
                recordId: mainForm.id,
                fileType: '普通附件'
              }"
              :on-success="takeUploadSuccess"
            ></base-upload>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<script>
import { saveOrderDeliverySend, updateOrderDeliverySend } from '@/api/order/order-delivery-send'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { filePrevie } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
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
        const { DICTS_DELIVERY_TYPE } = constant
        Promise.all([getDataDictionary([DICTS_DELIVERY_TYPE])]).then(([dicts]) => {
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
    handleSendDeliveryChange() {
      Object.assign(this.form, {
        deliveryCompany: '',
        deliveryFilePath: '',
        deliveryFileId: 0,
        deliveryFileName: '',
        fileList: [],
        deliveryAddress: '',
        deliveryPerson: '',
        deliveryMobile: '',
        remark: '',
        expressName: '',
        deliveryIdCard: ''
      })
    },
    handleSendAddressSelect(rows) {
      const { deliveryCompany, person, mobile } = rows[0]
      this.form.deliveryCompany = deliveryCompany
      this.form.deliveryPerson = person
      this.form.deliveryMobile = mobile
    },
    sendUploadSuccess(response, file, fileList) {
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
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        const formData = Object.assign(
          {
            orderId: this.mainForm.id,
            orderType: enums.ORDER_TYPE.getFieldByKey('SALE')
          },
          this.form
        )
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveOrderDeliverySend(formData)
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
            updateOrderDeliverySend(formData)
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
    :title="`客户收货信息${
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
              placeholder="请选择送货方式"
              :options="dicts[constant.DICTS_DELIVERY_TYPE]"
              @change="handleSendDeliveryChange"
            />
          </base-form-item>
        </base-col>

        <base-col v-if="form.deliveryType !== enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="24">
          <base-form-item label="收货地址" prop="deliveryAddress">
            <business-autocomplete-basic
              v-model="form.deliveryAddress"
              label="收货地址"
              placeholder="请输入收货地址"
              :is-exist="false"
              :module-name="constant.AUTOCOMPLETE_KEY_CUS_DELIVERY"
              :params="{ customerId: mainForm.customerId, addressType: enums.ADDRESS_TYPE.getFieldByKey('RECEIVING') }"
              @select="handleSendAddressSelect"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col v-if="form.deliveryType !== enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="24">
          <base-form-item label="收货公司" prop="deliveryCompany">
            <base-input v-model="form.deliveryCompany" placeholder="请输入收货公司" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item
            :label="`${form.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}人`"
            prop="deliveryPerson"
          >
            <base-input
              v-model="form.deliveryPerson"
              :placeholder="`请输入${form.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}人`"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item
            :label="`${form.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}电话`"
            prop="deliveryMobile"
          >
            <base-input
              v-model="form.deliveryMobile"
              :placeholder="`请输入${form.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}电话`"
            />
          </base-form-item>
        </base-col>

        <!-- 送货方式不为客户自提 -->
        <template v-if="form.deliveryType !== enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')">
          <!-- 送货方式为快递发货 -->
          <base-col v-if="form.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('EXPRESS_DELIVERY')" :span="24">
            <base-form-item label="快递公司" prop="expressName">
              <base-input v-model="form.expressName" placeholder="请输入快递公司" />
            </base-form-item>
          </base-col>
          <base-col :span="24">
            <base-form-item label="收货备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入收货备注" />
            </base-form-item>
          </base-col>
        </template>

        <!-- 送货方式为客户自提 -->
        <template v-if="form.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')">
          <base-col :span="24">
            <base-form-item label="提货人身份证" prop="deliveryIdCard">
              <base-input v-model="form.deliveryIdCard" placeholder="请输入提货人身份证" />
            </base-form-item>
          </base-col>
          <base-col :span="24">
            <base-form-item label="提货附件">
              <base-upload
                is-upload-only-one-file
                :file-list="form.fileList"
                :on-preview="handleFilePreview"
                :data="{
                  fileModule: constant.FILE_MODULE_SALE_ORDER_SEND_DELIBERY,
                  recordId: mainForm.id,
                  fileType: '普通附件'
                }"
                :on-success="sendUploadSuccess"
              ></base-upload>
            </base-form-item>
          </base-col>
        </template>
      </base-row>
    </base-form>
  </base-dialog>
</template>

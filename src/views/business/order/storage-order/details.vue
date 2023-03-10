<script>
import { getOrderStorageById, getOrderStorageAuditList, auditOrderStorage } from '@/api/order/order-storage'
import { deleteOrderDeliveryTakeById } from '@/api/order/order-delivery-take'
import { deleteOrderDeliverySendById } from '@/api/order/order-delivery-send'
import { getOrderStorageDetail, updatePriceOrderStorageDetail } from '@/api/order/order-storage-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload, filePrevie } from '@/utils'
import dayjs from '@/utils/day'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import EnterFormModifyPrice from './components/enter-form-modify-price'
import EnterFormTake from './components/enter-form-take'
import EnterFormSend from './components/enter-form-send'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm, EnterFormModifyPrice, EnterFormTake, EnterFormSend },
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
      form: {
        id: 0,
        auditStatus: '',
        customerId: 0,
        customerName: '',
        supplierId: 0,
        supplierName: '',
        cusOrderNo: '',
        tradeManName: '',
        tradeManId: 0,
        orderDate: dayjs().format('YYYY-MM-DD'),
        currencyName: '',
        settleCurrencyName: '',
        totalMoney: 0,
        remark: '',

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
      modifyPrice: {
        visible: false,
        row: {}
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
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getOrderStorageDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ orderId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getOrderStorageAuditList(this.tableRow.id),
        save: auditOrderStorage
      },
      showBtns: {
        edit: false,
        del: false
      },
      showAuditDetailsBtn: false,
      showPage: false
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_BUS_STORAGE_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.activeName = '????????????'
        this.loading = true
        this.operateTake = true
        const { DICTS_TAKE_DELIVERY_TYPE, DICTS_DELIVERY_TYPE, DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_TAKE_DELIVERY_TYPE, DICTS_DELIVERY_TYPE, DICTS_WHETHER_STATUS]),
          getOrderStorageById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { receivingStatus, shippingStatus, createByName, createTime, orderDeliveryTakeVOList, orderDeliverySendVOList } = info.data
          this.dicts = dicts

          this.columns = this.handleColumns()

          this.statusForm = {
            receivingStatus,
            shippingStatus
          }
          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(this.form, info.data)
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
            edit: this.permissions[constant.PERMISSION_BUS_STORAGE_EDIT],
            del: this.permissions[constant.PERMISSION_BUS_STORAGE_DEL]
          }

          if (isFunction(cb)) cb()
          this.showPage = true
          this.loading = false
        })
      })
    },
    handleColumns() {
      return [
        { field: 'partNo', title: '??????' },
        { field: 'productModel', title: '??????' },
        { field: 'productBrand', title: '??????' },
        { field: 'productOrigin', title: '??????' },
        { field: 'qty', title: '??????' },
        {
          field: 'price',
          title: '??????',
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
          title: '??????',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'packages',
          title: '??????',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'netWeight',
          title: '??????',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'grossWeight',
          title: '??????',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'productName', title: '??????' },
        { field: 'productUnit', title: '??????' },
        { field: 'volume', title: '??????' },
        { field: 'spq', title: '????????????' },
        { field: 'lotNo', title: '??????' },
        { field: 'dateCode', title: '????????????' },
        { field: 'remark', title: '??????' }
      ]
    },
    filePrevie(item) {
      filePrevie({ fileName: item.deliveryFileName, path: item.deliveryFilePath })
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
      await updatePriceOrderStorageDetail({ orderDetailId, price, totalMoney })
      this.detailsReLoad(false)
      this.modifyPrice = {
        visible: false,
        row: {}
      }
      done()
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
      // ???????????????id????????????????????????????????????
      if (item.id) {
        this.$confirm('???????????????????????????????')
          .then(() => {
            deleteOrderDeliveryTakeById(item.id).then(() => {
              this.getDetailsData()
              this.$message.success('????????????')
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
      // ???????????????id????????????????????????????????????
      if (item.id) {
        this.$confirm('???????????????????????????????')
          .then(() => {
            deleteOrderDeliverySendById(item.id).then(() => {
              this.getDetailsData()
              this.$message.success('????????????')
            })
          })
          .catch(() => {})
      } else {
        this.form.orderDeliverySendDTOList.splice(index, 1)
      }
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
      this.$refs['orderStorageDetailsRef'].refresh(isClearSelect)
    },
    // ????????????????????????????????????????????????
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.detailsReLoad()
      this.reLoad(true)
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
    class="common-operate storage-order"
    element-loading-text="???????????????"
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
            <!-- ???????????? -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="????????????" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      disabled
                      label="????????????"
                      placeholder="?????????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="supplierName">
                    <business-autocomplete-basic
                      v-model="form.supplierName"
                      label="???????????????"
                      disabled
                      placeholder="????????????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_SUPPLIER"
                      :auto-assign="{
                        supplierId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="orderDate">
                    <base-date-picker v-model="form.orderDate" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="cusOrderNo">
                    <base-input v-model="form.cusOrderNo" disabled placeholder="????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="currencyName">
                    <business-autocomplete-basic
                      v-model="form.currencyName"
                      disabled
                      label="????????????"
                      placeholder="?????????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled placeholder="?????????????????????" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="tradeManName">
                    <business-autocomplete-basic
                      v-model="form.tradeManName"
                      disabled
                      key-field="userId"
                      label="????????????"
                      placeholder="?????????????????????"
                      :module-name="constant.AUTOCOMPLETE_KEY_TRADEMAN"
                      :auto-assign="{
                        tradeManId: 'userId'
                      }"
                      :form="form"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="??????" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="???????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!-- ???????????? -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
              </span>
              <base-page
                v-if="showPage"
                ref="orderStorageDetailsRef"
                :request="request"
                :columns="columns"
                :tools-config="{
                  setting: {
                    visible: false
                  },
                  download: {
                    visible: false
                  }
                }"
                :buttons-config="{
                  mores: [
                    {
                      label: '????????????',
                      visible: form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'),
                      handler: rows => handleModifyPrice(rows)
                    }
                  ]
                }"
                height="380px"
                show-footer
                :name="constant.TABLE_NAME_BUS_STORAGE_ORDER_DETAILS"
              />
            </div>

            <!-- ?????????????????? -->
            <div class="common-operate-block">
              <el-collapse class="collapse">
                <el-collapse-item>
                  <template #title>
                    <i class="icon el-icon-s-grid"></i>
                    <span>??????????????????</span>
                  </template>
                  <div class="content">
                    <div style="padding: 10px 0 0 10px">
                      <el-button type="primary" size="mini" :disabled="false" @click="handleTakeAdd">????????????</el-button>
                    </div>
                    <div class="delivery-info">
                      <template v-if="form.orderDeliveryTakeDTOList.length">
                        <div v-for="(item, index) in form.orderDeliveryTakeDTOList" :key="item.id" class="delivery-info-item">
                          <div class="delivery-info-main">
                            <!-- ??????????????? -->
                            <template v-if="item.deliveryType === enums.TAKE_DELIVERY_TYPE.getFieldByKey('SUPPLIER_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                ???????????????<span class="is-extrude">{{ enums.TAKE_DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.warehouseName || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.takeAddress || '-' }}</span
                                >??? ??????????????????<span class="is-extrude">{{ item.takePerson || '-' }}</span
                                >??? ?????????????????????<span class="is-extrude">{{ item.takeMobile || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.takeDate || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.remark || '-' }}</span
                                >???
                              </div>
                            </template>
                            <!-- ??????????????????????????? -->
                            <template v-else-if="handleTakeCondition(item.deliveryType)">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                ???????????????<span class="is-extrude">{{ enums.TAKE_DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.takeAddress || '-' }}</span
                                >??? ??????????????????<span class="is-extrude">{{ item.takePerson || '-' }}</span
                                >??? ?????????????????????<span class="is-extrude">{{ item.takeMobile || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.takeDate || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.remark || '-' }}</span
                                >??????????????????<span class="is-extrude"
                                  ><el-link type="primary" @click="filePrevie(item)">{{ item.deliveryFileName || '-' }}</el-link></span
                                >???
                              </div>
                            </template>
                            <!-- ???????????? -->
                            <template v-else-if="item.deliveryType === enums.TAKE_DELIVERY_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                ???????????????<span class="is-extrude">{{ enums.TAKE_DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.warehouseName || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.takeAddress || '-' }}</span
                                >??? ??????????????????<span class="is-extrude">{{ item.takePerson || '-' }}</span
                                >??? ?????????????????????<span class="is-extrude">{{ item.takeMobile || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.expressName || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.expressNo || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.takeDate || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.remark || '-' }}</span
                                >???
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

            <!-- ?????????????????? -->
            <div class="common-operate-block">
              <el-collapse class="collapse">
                <el-collapse-item>
                  <template #title>
                    <i class="icon el-icon-s-grid"></i>
                    <span>??????????????????</span>
                  </template>
                  <div class="content">
                    <div style="padding: 10px 0 0 10px">
                      <el-button type="primary" size="mini" :disabled="false" @click="handleSendAdd">????????????</el-button>
                    </div>
                    <div class="delivery-info">
                      <template v-if="form.orderDeliverySendDTOList.length">
                        <div v-for="(item, index) in form.orderDeliverySendDTOList" :key="item.id" class="delivery-info-item">
                          <div class="delivery-info-main">
                            <!-- ???????????? -->
                            <template v-if="item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                ???????????????<span class="is-extrude">{{ enums.DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.deliveryAddress || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.deliveryCompany || '-' }}</span
                                >??? ????????????<span class="is-extrude">{{ item.deliveryPerson || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.deliveryMobile || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.expressName || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.remark || '-' }}</span
                                >???
                              </div>
                            </template>
                            <!-- ???????????? -->
                            <template v-else-if="item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('SUPPLIER_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                ???????????????<span class="is-extrude">{{ enums.DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.deliveryAddress || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.deliveryCompany || '-' }}</span
                                >??? ????????????<span class="is-extrude">{{ item.deliveryPerson || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.deliveryMobile || '-' }}</span
                                >??????????????????<span class="is-extrude">{{ item.remark || '-' }}</span
                                >???
                              </div>
                            </template>

                            <!-- ???????????? -->
                            <template v-else-if="item.deliveryType === enums.DELIVERY_TYPE.getFieldByKey('TAKE_DELIVERY')">
                              <span class="delivery-info-seq">{{ index + 1 }}</span>
                              <div class="delivery-info-content">
                                ???????????????<span class="is-extrude">{{ enums.DELIVERY_TYPE.getFieldByValue(item.deliveryType) }}</span
                                >??? ????????????<span class="is-extrude">{{ item.takePerson || '-' }}</span
                                >??? ???????????????<span class="is-extrude">{{ item.deliveryMobile || '-' }}</span
                                >??? ?????????????????????<span class="is-extrude">{{ item.deliveryIdCard || '-' }}</span
                                >??? ???????????????<span class="is-extrude"
                                  ><el-link type="primary" @click="filePrevie(item)">{{ item.deliveryFileName || '-' }}</el-link></span
                                >???
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
          <el-divider content-position="left">??????</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div
              class="dcommon-etails-r-value"
              :style="{ color: enums.RECEIVING_STATUS.getFieldByValue(statusForm.receivingStatus, 'color') }"
            >
              {{ enums.RECEIVING_STATUS.getFieldByValue(statusForm.receivingStatus) }}
            </div>
          </div>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div
              class="dcommon-etails-r-value"
              :style="{ color: enums.WARE_SHIPPING_STATUS.getFieldByValue(statusForm.shippingStatus, 'color') }"
            >
              {{ enums.WARE_SHIPPING_STATUS.getFieldByValue(statusForm.shippingStatus) }}
            </div>
          </div>
        </div>
        <div class="common-operate-r-block">
          <el-divider content-position="left">????????????</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">?????????:</div>
            <div class="dcommon-etails-r-value">{{ createForm.createByName }}</div>
          </div>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div class="common-operate-r-value">{{ createForm.createTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-operate-b">
      <div class="common-operate-b-wrap">
        <el-button
          v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-delete"
          type="danger"
          @click="handleDelete"
          >??????</el-button
        >
        <el-button
          v-if="showBtns.edit && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-edit"
          type="warning"
          @click="handleEdit"
          >??????</el-button
        >
      </div>
    </div>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
    <enter-form-modify-price v-model="modifyPrice.visible" :table-row="modifyPrice.row" @save="handleModifyPriceSave" />
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
  </div>
</template>

<style lang="scss" scoped>
.storage-order {
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

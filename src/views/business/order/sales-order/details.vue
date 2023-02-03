<script>
import { getOrderSaleById, getOrderSaleAuditList, auditOrderSale } from '@/api/order/order-sale'
import { deleteOrderDeliverySendById } from '@/api/order/order-delivery-send'
import { getOrderSaleDetail, updatePriceOrderSaleDetail } from '@/api/order/order-sale-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { getSysReportByMenuMarkSysReportConfig } from '@/api/admin/sys-report-config'
import { transforArrayPayload, filePrevie } from '@/utils'
import dayjs from '@/utils/day'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import EnterFormModifyPrice from './components/enter-form-modify-price'
import EnterFormSend from './components/enter-form-send'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm, EnterFormModifyPrice, EnterFormSend },
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
        shippingStatus: ''
      },
      sendForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('ADDED'),
        row: {}
      },
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getOrderSaleDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ orderId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getOrderSaleAuditList(this.tableRow.id),
        save: auditOrderSale
      },
      showBtns: {
        edit: false,
        del: false,
        export: false
      },
      showAuditDetailsBtn: false,
      showPage: false,
      businessExport: {
        visible: false,
        request: async () => {
          const { data } = await getSysReportByMenuMarkSysReportConfig({ menuMark: constant.PERMISSION_BUS_SALES_EXPORT })
          return { data }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_BUS_SALES_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.activeName = '订单明细'
        this.loading = true
        const { DICTS_DELIVERY_TYPE, DICTS_WHETHER_STATUS } = constant
        Promise.all([getDataDictionary([DICTS_DELIVERY_TYPE, DICTS_WHETHER_STATUS]), getOrderSaleById(this.tableRow.id)]).then(
          ([dicts, info]) => {
            const { receivingStatus, shippingStatus, createByName, createTime, orderDeliveryTakeVOList, orderDeliverySendVOList } =
              info.data
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
              edit: this.permissions[constant.PERMISSION_BUS_SALES_EDIT],
              del: this.permissions[constant.PERMISSION_BUS_SALES_DEL],
              export: this.permissions[constant.PERMISSION_BUS_SALES_EXPORT]
            }

            if (isFunction(cb)) cb()
            this.showPage = true
            this.loading = false
          }
        )
      })
    },
    handleColumns() {
      return [
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productOrigin', title: '产地' },
        { field: 'productName', title: '品名' },
        { field: 'productUnit', title: '单位' },
        { field: 'qty', title: '数量' },
        {
          field: 'purchasePrice',
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
          title: '采购总价',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'price',
          title: '销售单价',
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
          title: '销售总价',
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'saleProfit',
          title: '销售利润',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'remark', title: '备注', type: 'input', width: 120 }
      ]
    },
    handleExport() {
      this.businessExport.visible = true
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
      await updatePriceOrderSaleDetail({ orderDetailId, price, totalMoney })
      this.detailsReLoad(false)
      this.modifyPrice = {
        visible: false,
        row: {}
      }
      done()
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
      this.$refs['orderAgentSaleDetailsRef'].refresh(isClearSelect)
    },
    // 修改某一项时，刷新列表页和详情页
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.detailsReLoad()
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate sale-order"
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
                      disabled
                      label="客户名称"
                      placeholder="请输入客户名称"
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="代销订单号" prop="agentOrderNo">
                    <business-autocomplete-basic
                      v-model="form.agentOrderNo"
                      disabled
                      label="代销订单号"
                      placeholder="请输入代销订单号"
                      :params="{
                        auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS')
                      }"
                      :module-name="constant.AUTOCOMPLETE_KEY_AGENT_SALE_ORDER"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="订单日期" prop="orderDate">
                    <base-date-picker v-model="form.orderDate" disabled placeholder="请输入订单日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="销售币别" prop="currencyName">
                    <business-autocomplete-basic
                      v-model="form.currencyName"
                      disabled
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
                      disabled
                      label="采购主体"
                      :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                      placeholder="请输入采购主体"
                      :auto-assign="{
                        principalId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="业务名称" prop="saleManName">
                    <business-autocomplete-basic
                      v-model="form.saleManName"
                      key-field="userId"
                      disabled
                      label="业务名称"
                      placeholder="请输入业务名称"
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
                      disabled
                      key-field="userId"
                      label="商务名称"
                      placeholder="请输入商务名称"
                      :module-name="constant.AUTOCOMPLETE_KEY_TRADEMAN"
                      :auto-assign="{
                        tradeManId: 'userId'
                      }"
                      :form="form"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="销售总价" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled placeholder="请输入销售总价" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="销售利润" prop="saleProfit">
                    <base-input-number v-model="form.saleProfit" disabled placeholder="请输入销售利润" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="请输入备注" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!-- 订单明细 -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                订单明细
              </span>
              <base-page
                v-if="showPage"
                ref="orderAgentSaleDetailsRef"
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
                      label: '修改价格',
                      visible: form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'),
                      handler: rows => handleModifyPrice(rows)
                    }
                  ]
                }"
                height="380px"
                show-footer
                :name="constant.TABLE_NAME_SALE_ORDER_DETAILS"
              />
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
          <el-divider content-position="left">状态</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">入库状态:</div>
            <div
              class="dcommon-etails-r-value"
              :style="{ color: enums.RECEIVING_STATUS.getFieldByValue(statusForm.receivingStatus, 'color') }"
            >
              {{ enums.RECEIVING_STATUS.getFieldByValue(statusForm.receivingStatus) }}
            </div>
          </div>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">出库状态:</div>
            <div
              class="dcommon-etails-r-value"
              :style="{ color: enums.WARE_SHIPPING_STATUS.getFieldByValue(statusForm.shippingStatus, 'color') }"
            >
              {{ enums.WARE_SHIPPING_STATUS.getFieldByValue(statusForm.shippingStatus) }}
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
        <el-button v-if="showBtns.export" icon="el-icon-download" type="info" @click="handleExport">导出</el-button>
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
    <business-export v-model="businessExport.visible" :request="businessExport.request" :table-rows="[tableRow]" />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
    <enter-form-modify-price v-model="modifyPrice.visible" :table-row="modifyPrice.row" @save="handleModifyPriceSave" />
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
.sale-order {
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

<script>
import { getOrderPurchaseById, getOrderPurchaseAuditList, auditOrderPurchase } from '@/api/order/order-purchase'
import { deleteOrderDeliveryTakeById } from '@/api/order/order-delivery-take'
import { getOrderPurchaseDetail } from '@/api/order/order-purchase-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload, filePrevie } from '@/utils'
import dayjs from '@/utils/day'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import EnterFormTake from './components/enter-form-take'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm, EnterFormTake },
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
        supplierId: 0,
        supplierName: '',
        cusOrderNo: '',
        principalId: 0,
        principalName: '',
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
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      dicts: {},
      createForm: {
        createByName: '',
        createTime: ''
      },
      statusForm: {
        receivingStatus: ''
      },
      takeForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('ADDED'),
        row: {}
      },
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getOrderPurchaseDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ orderId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getOrderPurchaseAuditList(this.tableRow.id),
        save: auditOrderPurchase
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
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_BUS_PURCHASE_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.activeName = '订单明细'
        this.loading = true
        this.operateTake = true
        const { DICTS_TAKE_DELIVERY_TYPE, DICTS_WHETHER_STATUS } = constant
        Promise.all([getDataDictionary([DICTS_TAKE_DELIVERY_TYPE, DICTS_WHETHER_STATUS]), getOrderPurchaseById(this.tableRow.id)]).then(
          ([dicts, info]) => {
            const { receivingStatus, createByName, createTime, orderDeliveryTakeVOList } = info.data
            this.dicts = dicts

            this.columns = this.handleColumns()

            this.statusForm = {
              receivingStatus
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

            this.showBtns = {
              edit: this.permissions[constant.PERMISSION_BUS_PURCHASE_EDIT],
              del: this.permissions[constant.PERMISSION_BUS_PURCHASE_DEL]
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
          field: 'price',
          title: '采购单价',
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
          title: '采购总价',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'lotNo', title: '批号' },
        { field: 'remark', title: '备注' }
      ]
    },
    filePrevie(item) {
      filePrevie({ fileName: item.deliveryFileName, path: item.deliveryFilePath })
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
      this.$refs['orderPurchaseDetailsRef'].refresh(isClearSelect)
    },
    // 修改某一项时，刷新列表页和详情页
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
    class="common-operate purchase-order"
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
                  <base-form-item label="服务协议" prop="cusContractNo">
                    <business-autocomplete-basic
                      v-model="form.cusContractNo"
                      disabled
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
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="供应商名称" prop="supplierName">
                    <business-autocomplete-basic
                      v-model="form.supplierName"
                      label="供应商名称"
                      disabled
                      placeholder="请输入供应商名称"
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
                    <base-date-picker v-model="form.orderDate" disabled placeholder="请输入订单日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="客户订单号" prop="cusOrderNo">
                    <base-input v-model="form.cusOrderNo" disabled placeholder="请输入客户订单号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="采购币别" prop="currencyName">
                    <business-autocomplete-basic
                      v-model="form.currencyName"
                      disabled
                      label="采购币别"
                      placeholder="请输入采购币别"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="采购总价" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled placeholder="请输入采购总价" :precision="2" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="采购主体" prop="principalName">
                    <business-autocomplete-basic
                      v-model="form.principalName"
                      disabled
                      label="采购主体"
                      :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
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
                      disabled
                      key-field="userId"
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
                ref="orderPurchaseDetailsRef"
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
                height="380px"
                show-footer
                :name="constant.TABLE_NAME_PURCHASE_ORDER_DETAILS"
              />
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
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
    <enter-form-take
      v-model="takeForm.visible"
      :type="takeForm.type"
      :table-row="takeForm.row"
      :main-form="form"
      :re-load="handleUpdateInfoReload"
    ></enter-form-take>
  </div>
</template>

<style lang="scss" scoped>
.purchase-order {
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

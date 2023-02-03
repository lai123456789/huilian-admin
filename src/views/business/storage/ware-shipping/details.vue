<script>
import {
  getWareShippingById,
  getWareShippingAuditList,
  auditWareShipping,
  choiceWareShippingById,
  choiceRollBackWareShippingById,
  checkSignWareShippingById,
  checkRollBackWareShippingById,
  inspectionWareShippingById,
  inspectionRollBackWareShippingById,
  checkoutWareShippingById,
  checkoutRollBackWareShippingById
} from '@/api/warehouse/ware-shipping'
import { getWareShippingDetail } from '@/api/warehouse/ware-shipping-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { getSysReportByMenuMarkSysReportConfig } from '@/api/admin/sys-report-config'
import { transforArrayPayload } from '@/utils'
import dayjs from '@/utils/day'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm },
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
        auditStatus: void 0,
        customerId: 0,
        customerName: '',
        orderId: 0,
        orderNo: '',
        warehouseId: 0,
        warehouseName: '',
        shippingDate: dayjs().format('YYYY-MM-DD'),
        orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT'),
        shippingType: '',
        deliveryAddress: '',
        deliveryCompany: '',
        deliveryIdCard: '',
        deliveryMobile: '',
        deliveryPerson: '',
        expressName: '',
        expressNo: '',
        transferFlag: enums.WHETHER_STATUS.getFieldByKey('NO'),
        endWarehouseName: '',
        endWarehouseId: 0,
        isBuyEx: enums.WHETHER_STATUS.getFieldByKey('NO'),
        remark: ''
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      statusForm: {
        shippingStatus: ''
      },
      showBtns: {
        edit: false,
        del: false,
        export: false
      },
      dicts: {},
      showPage: false,
      shippingTypeOptions: [],
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getWareShippingDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ shippingId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getWareShippingAuditList(this.tableRow.id),
        save: auditWareShipping
      },
      showAuditDetailsBtn: false,
      dropdownButtonMoresOptions: [],
      businessExport: {
        visible: false,
        request: async () => {
          const { data } = await getSysReportByMenuMarkSysReportConfig({ menuMark: constant.PERMISSION_WARE_SHIPPING_EXPORT })
          return { data }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_WARE_SHIPPING_AUDIT]
    this.dropdownButtonMoresOptions = [
      {
        label: '备货',
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_CHOICE],
        handler: () => this.handleMoresFunc('choice')
      },
      {
        label: '取消备货',
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_CHOICE_ROLL_BACK],
        handler: () => this.handleMoresFunc('choiceRollBack')
      },
      {
        label: '验货完成',
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_INSPEC],
        handler: () => this.handleMoresFunc('inspection')
      },
      {
        label: '验货撤回',
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_INSPEC_ROLL_BACK],
        handler: () => this.handleMoresFunc('inspectionRollBack')
      },
      {
        label: '出库',
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_CHECKOUT],
        handler: () => this.handleMoresFunc('checkout')
      },
      {
        label: '出库撤回',
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_CHECKOUT_ROLL_BACK],
        handler: () => this.handleMoresFunc('checkoutRollBack')
      },
      {
        label: '签收',
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_SIGN],
        handler: () => this.handleMoresFunc('sign')
      },
      {
        label: '签收撤回',
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_SIGN_ROLL_BACK],
        handler: () => this.handleMoresFunc('signRollBack')
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_SHIPPING_ORDER_TYPE, DICTS_SHIPPING_TYPE, DICTS_WHETHER_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_SHIPPING_ORDER_TYPE, DICTS_SHIPPING_TYPE, DICTS_WHETHER_STATUS]),
          getWareShippingById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { shippingStatus, orderType, createByName, createTime } = info.data
          this.dicts = dicts
          this.statusForm = {
            shippingStatus
          }
          this.createForm = {
            createByName,
            createTime
          }
          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_WARE_SHIPPING_EDIT],
            del: this.permissions[constant.PERMISSION_WARE_SHIPPING_DEL],
            export: this.permissions[constant.PERMISSION_WARE_SHIPPING_EXPORT]
          }

          // 根据订单类型取对应下标列数据
          this.columns =
            this.handleDetailsColumns()[
              [
                enums.ORDER_TYPE.getFieldByKey('IMPORT'),
                enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'),
                enums.ORDER_TYPE.getFieldByKey('SALE')
              ].indexOf(orderType) > -1
                ? 0
                : 1
            ]

          this.shippingTypeOptions = this.shippingTypesByAuditStatusOptions(this.dicts[DICTS_SHIPPING_TYPE])

          if (isFunction(cb)) cb()
          this.showPage = true
          this.loading = false
        })
      })
    },
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        [
          { field: 'partNo', title: '料号' },
          { field: 'orderNo', title: '订单编号' },
          { field: 'productName', title: '品名' },
          { field: 'productModel', title: '型号' },
          { field: 'productBrand', title: '品牌' },
          { field: 'productOrigin', title: '产地' },
          { field: 'productUnit', title: '单位' },
          {
            field: 'qty',
            title: '数量',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          { field: 'lotNo', title: '批号' },
          { field: 'dateCode', title: '生产日期' },
          { field: 'remark', title: '备注' }
        ],
        [
          { field: 'partNo', title: '料号' },
          { field: 'orderNo', title: '订单编号' },
          {
            field: 'productName',
            title: '品名'
          },
          {
            field: 'productModel',
            title: '型号'
          },
          { field: 'productBrand', title: '品牌' },
          {
            field: 'productOrigin',
            title: '产地'
          },
          {
            field: 'productUnit',
            title: '单位'
          },
          {
            field: 'qty',
            title: '数量',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          { field: 'lotNo', title: '批号' },
          { field: 'dateCode', title: '生产日期' },
          { field: 'remark', title: '备注' }
        ]
      ]
    },
    shippingTypesByAuditStatusOptions(shippingTypes) {
      const arr = [
        enums.SHIPPING_TYPE.getFieldByKey('SUPPLIER_DELIVERY'),
        enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY'),
        enums.SHIPPING_TYPE.getFieldByKey('EXPRESS_DELIVERY')
      ]
      return this.form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')
        ? shippingTypes.filter(v => arr.includes(v.value))
        : shippingTypes
    },
    handleExport() {
      this.businessExport.visible = true
    },
    async handleMoresFunc(type) {
      if (type === 'choice') {
        await choiceWareShippingById(this.tableRow.id)
      } else if (type === 'choiceRollBack') {
        await choiceRollBackWareShippingById(this.tableRow.id)
      } else if (type === 'checkout') {
        await checkoutWareShippingById(this.tableRow.id)
      } else if (type === 'checkoutRollBack') {
        await checkoutRollBackWareShippingById(this.tableRow.id)
      } else if (type === 'inspection') {
        await inspectionWareShippingById(this.tableRow.id)
      } else if (type === 'inspectionRollBack') {
        await inspectionRollBackWareShippingById(this.tableRow.id)
      } else if (type === 'sign') {
        await checkSignWareShippingById(this.tableRow.id)
      } else if (type === 'signRollBack') {
        await checkRollBackWareShippingById(this.tableRow.id)
      }
      this.handleUpdateInfoReload()
      this.$message.success('操作成功')
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
      this.$refs['orderDetailsRef'].refresh(isClearSelect)
    },
    // 修改某一项时，刷新列表页和详情页
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.detailsReLoad(false)
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate ware-shipping is-details-adaptive"
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
                  <base-form-item label="订单类型" prop="orderType">
                    <base-select v-model="form.orderType" disabled placeholder="" :options="dicts[constant.DICTS_SHIPPING_ORDER_TYPE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="客户名称" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      disabled
                      label=""
                      placeholder=""
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="仓库" prop="warehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.warehouseName"
                      value-key="warehouseName"
                      disabled
                      label="仓库"
                      placeholder=""
                      :auto-assign="{
                        warehouseId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-warehouse>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="出库日期" prop="shippingDate">
                    <base-date-picker v-model="form.shippingDate" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="出库方式" prop="shippingType">
                    <base-select v-model="form.shippingType" disabled placeholder="" :options="shippingTypeOptions" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收货公司" prop="deliveryCompany">
                    <business-autocomplete-basic
                      v-model="form.deliveryCompany"
                      label="收货公司"
                      placeholder=""
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_CUS_DELIVERY"
                      :params="{
                        customerId: form.customerId
                      }"
                      :auto-assign="{
                        deliveryAddress: 'deliveryAddress',
                        deliveryMobile: 'mobile',
                        deliveryPerson: 'person'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col v-if="form.shippingType !== enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="6">
                  <base-form-item label="送货地址" prop="deliveryAddress">
                    <base-input v-model="form.deliveryAddress" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    :label="`${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}人`"
                    prop="deliveryPerson"
                  >
                    <base-input v-model="form.deliveryPerson" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item
                    :label="`${form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') ? '提货' : '收货'}电话`"
                    prop="deliveryMobile"
                  >
                    <base-input v-model="form.deliveryMobile" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY')" :span="6">
                  <base-form-item label="提货人身份证" prop="deliveryIdCard">
                    <base-input v-model="form.deliveryIdCard" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <template v-if="form.shippingType === enums.SHIPPING_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
                  <base-col :span="6">
                    <base-form-item label="快递服务商" prop="expressName">
                      <base-input v-model="form.expressName" disabled placeholder="" />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="快递单号" prop="expressNo">
                      <base-input v-model="form.expressNo" disabled placeholder="" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!-- 出库明细 -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                出库明细
              </span>
              <div class="common-operate-block-body">
                <base-page
                  v-if="showPage"
                  ref="orderDetailsRef"
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
                  show-footer
                  :name="constant.TABLE_NAME_WARE_SHIPPING_DETAILS"
                />
              </div>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">状态</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">出库状态:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.SHIPPING_FLAG.getFieldByValue(statusForm.shippingStatus, 'color') }">
              {{ enums.SHIPPING_FLAG.getFieldByValue(statusForm.shippingStatus) }}
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
        <business-dropdown-button :options="dropdownButtonMoresOptions">更多操作</business-dropdown-button>
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
    <business-export v-model="businessExport.visible" :request="businessExport.request" :table-rows="[form]" />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
  </div>
</template>

<style lang="scss" scoped>
.ware-shipping {
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
  .common-operate-block-body {
    min-height: 250px;
  }
  .common-operate-block {
    &.is-special {
      .common-operate-block-header {
        margin-bottom: 0;
      }
    }
  }
}
</style>

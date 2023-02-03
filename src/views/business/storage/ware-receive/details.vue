<script>
import { getWareReceivingById, getWareReceivingAuditList, auditWareReceiving } from '@/api/warehouse/ware-receiving'
import { getWareReceivingDetail } from '@/api/warehouse/ware-receiving-detail'
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
        supplierId: 0,
        supplierName: '',
        orderId: 0,
        orderNo: '',
        warehouseId: 0,
        warehouseName: '',
        receivingDate: dayjs().format('YYYY-MM-DD'),
        orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT'),
        receivingType: '',
        expressName: '',
        expressNo: '',
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
      showBtns: {
        edit: false,
        del: false,
        export: false
      },
      dicts: {},
      showPage: false,
      receivingTypeOptions: [],
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getWareReceivingDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ receivingId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getWareReceivingAuditList(this.tableRow.id),
        save: auditWareReceiving
      },
      showAuditDetailsBtn: false,
      businessExport: {
        visible: false,
        request: async () => {
          const { data } = await getSysReportByMenuMarkSysReportConfig({ menuMark: constant.PERMISSION_WARE_RECEIVE_EXPORT })
          return { data }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    orderModuleName() {
      let moduleName = ''
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
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_WARE_RECEIVE_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_RECEIVE_ORDER_TYPE, DICTS_RECEIVE_TYPE } = constant
        Promise.all([getDataDictionary([DICTS_RECEIVE_ORDER_TYPE, DICTS_RECEIVE_TYPE]), getWareReceivingById(this.tableRow.id)]).then(
          ([dicts, info]) => {
            const { createByName, createTime } = info.data
            this.dicts = dicts

            this.createForm = {
              createByName,
              createTime
            }
            Object.assign(this.form, info.data)

            this.showBtns = {
              edit: this.permissions[constant.PERMISSION_WARE_RECEIVE_EDIT],
              del: this.permissions[constant.PERMISSION_WARE_RECEIVE_DEL],
              export: this.permissions[constant.PERMISSION_WARE_RECEIVE_EXPORT]
            }

            this.columns = this.handleDetailsColumns()

            this.receivingTypeOptions = this.rceivingTypesByAuditStatusOptions(this.dicts[DICTS_RECEIVE_TYPE])

            if (isFunction(cb)) cb()
            this.showPage = true
            this.loading = false
          }
        )
      })
    },
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        { field: 'partNo', title: '料号' },
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
        {
          field: 'netWeight',
          title: '净重',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'grossWeight',
          title: '毛重',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'volume', title: '体积' },
        {
          field: 'packages',
          title: '件数',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'lotNo', title: '批号' },
        { field: 'dateCode', title: '生产日期' },
        { field: 'ctnsNo', title: '箱号' },
        { field: 'location', title: '库位' },
        { field: 'remark', title: '备注' }
      ]
    },
    handleExport() {
      this.businessExport.visible = true
    },
    rceivingTypesByAuditStatusOptions(receivingTypes) {
      const arr = [
        enums.RECEIVING_TYPE.getFieldByKey('SUPPLIER_DELIVERY'),
        enums.RECEIVING_TYPE.getFieldByKey('TAKE_DELIVERY'),
        enums.RECEIVING_TYPE.getFieldByKey('EXPRESS_DELIVERY')
      ]
      return this.form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')
        ? receivingTypes.filter(v => arr.includes(v.value))
        : receivingTypes
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
    class="common-operate ware-receive is-details-adaptive"
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
                    <base-select v-model="form.orderType" disabled placeholder="" :options="dicts[constant.DICTS_RECEIVE_ORDER_TYPE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="订单编号" prop="orderNo">
                    <business-autocomplete-basic
                      v-model="form.orderNo"
                      label="订单编号"
                      disabled
                      placeholder=""
                      :params="{
                        auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS'),
                        receivingStatus: [
                          enums.RECEIVING_STATUS.getFieldByKey('WAIT'),
                          enums.RECEIVING_STATUS.getFieldByKey('PART'),
                          enums.RECEIVING_STATUS.getFieldByKey('ERROR')
                        ].join(',')
                      }"
                      :module-name="orderModuleName"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="客户名称" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      label="客户名称"
                      disabled
                      placeholder=""
                      :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMER"
                      :auto-assign="{
                        customerId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
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
                  <base-form-item label="入库日期" prop="receivingDate">
                    <base-date-picker v-model="form.receivingDate" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="入库方式" prop="receivingType">
                    <base-select v-model="form.receivingType" disabled placeholder="" :options="receivingTypeOptions" />
                  </base-form-item>
                </base-col>

                <template v-if="form.receivingType === enums.RECEIVING_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
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

            <!--入库明细 -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                入库明细
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
                  :name="constant.TABLE_NAME_WARE_RECEIVING_DETAILS"
                />
              </div>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
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
    <business-export v-model="businessExport.visible" :request="businessExport.request" :table-rows="[form]" />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
  </div>
</template>

<style lang="scss" scoped>
.ware-receive {
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

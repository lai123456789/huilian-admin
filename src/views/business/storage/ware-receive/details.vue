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
    // ??????????????????
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
    /** ??????????????? */
    handleDetailsColumns() {
      return [
        { field: 'partNo', title: '??????' },
        { field: 'productName', title: '??????' },
        { field: 'productModel', title: '??????' },
        { field: 'productBrand', title: '??????' },
        { field: 'productOrigin', title: '??????' },
        { field: 'productUnit', title: '??????' },
        {
          field: 'qty',
          title: '??????',
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
          title: '??????',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'grossWeight',
          title: '??????',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'volume', title: '??????' },
        {
          field: 'packages',
          title: '??????',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'lotNo', title: '??????' },
        { field: 'dateCode', title: '????????????' },
        { field: 'ctnsNo', title: '??????' },
        { field: 'location', title: '??????' },
        { field: 'remark', title: '??????' }
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
    // ????????????????????????????????????????????????
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
                  <base-form-item label="????????????" prop="orderType">
                    <base-select v-model="form.orderType" disabled placeholder="" :options="dicts[constant.DICTS_RECEIVE_ORDER_TYPE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="orderNo">
                    <business-autocomplete-basic
                      v-model="form.orderNo"
                      label="????????????"
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
                  <base-form-item label="????????????" prop="customerName">
                    <business-autocomplete-basic
                      v-model="form.customerName"
                      label="????????????"
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
                  <base-form-item label="???????????????" prop="supplierName">
                    <business-autocomplete-basic
                      v-model="form.supplierName"
                      disabled
                      label="???????????????"
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
                  <base-form-item label="??????" prop="warehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.warehouseName"
                      value-key="warehouseName"
                      disabled
                      label="??????"
                      placeholder=""
                      :auto-assign="{
                        warehouseId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-warehouse>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="receivingDate">
                    <base-date-picker v-model="form.receivingDate" disabled placeholder="" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="receivingType">
                    <base-select v-model="form.receivingType" disabled placeholder="" :options="receivingTypeOptions" />
                  </base-form-item>
                </base-col>

                <template v-if="form.receivingType === enums.RECEIVING_TYPE.getFieldByKey('EXPRESS_DELIVERY')">
                  <base-col :span="6">
                    <base-form-item label="???????????????" prop="expressName">
                      <base-input v-model="form.expressName" disabled placeholder="" />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="????????????" prop="expressNo">
                      <base-input v-model="form.expressNo" disabled placeholder="" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col :span="12">
                  <base-form-item label="??????" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--???????????? -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
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
        <el-button v-if="showBtns.export" icon="el-icon-download" type="info" @click="handleExport">??????</el-button>
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

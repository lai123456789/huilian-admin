<script>
import { getWareDeliveryTakeById, getWareDeliveryTakeAuditList, auditWareDeliveryTake } from '@/api/warehouse/ware-delivery-take'
import { getWareShipping } from '@/api/warehouse/ware-shipping'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
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
        warehouseId: 0,
        warehouseName: '',
        plateNo: '',
        person: '',
        takeDate: '',
        takePerson: '',
        takeIdCard: '',
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
        del: false
      },
      dicts: {},
      showPage: false,
      receivingTypeOptions: [],
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getWareShipping({
          ...pager,
          ...transforArrayPayload(
            Object.assign({ deliveryId: this.tableRow.id, shippingType: enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY') }, params)
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getWareDeliveryTakeAuditList(this.tableRow.id),
        save: auditWareDeliveryTake
      },
      showAuditDetailsBtn: false
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_TAKE_NO_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        Promise.all([getDataDictionary([]), getWareDeliveryTakeById(this.tableRow.id)]).then(([dicts, info]) => {
          const { createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }
          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_TAKE_NO_EDIT],
            del: this.permissions[constant.PERMISSION_TAKE_NO_DEL]
          }

          this.columns = this.handleDetailsColumns()

          if (isFunction(cb)) cb()
          this.showPage = true
          this.loading = false
        })
      })
    },
    /** ??????????????? */
    handleDetailsColumns() {
      return [
        { field: 'shippingNo', title: '????????????' },
        {
          field: 'orderType',
          title: '????????????',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SHIPPING_ORDER_TYPE)
            }
          }
        },
        { field: 'orderNo', title: '????????????' },
        { field: 'customerName', title: '????????????' },
        { field: 'totalQty', title: '?????????', sum: true, footerConfig: { precision: 6 } },
        { field: 'totalPackages', title: '?????????', sum: true, footerConfig: { precision: 6 } },
        { field: 'totalGrossWeight', title: '?????????', sum: true, footerConfig: { precision: 6 } },
        { field: 'totalNetWeight', title: '	?????????', sum: true, footerConfig: { precision: 6 } },
        { field: 'deliveryAddress', title: '????????????' },
        { field: 'deliveryCompany', title: '????????????' },
        { field: 'deliveryIdCard', title: '?????????' },
        { field: 'deliveryPerson', title: '????????????' },
        { field: 'remark', title: '??????' }
      ]
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
    // ????????????????????????????????????????????????
    handleUpdateInfoReload() {
      this.getDetailsData()
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate take-no is-details-adaptive"
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
          <base-form ref="formRef" :model="form" label-width="80px" size="mini">
            <!-- ???????????? -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ????????????
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="??????" prop="warehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.warehouseName"
                      value-key="warehouseName"
                      disabled
                      label="??????"
                      placeholder="???????????????"
                      :auto-assign="{
                        warehouseId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-warehouse>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="plateNo">
                    <base-input v-model="form.plateNo" disabled placeholder="???????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????" prop="person">
                    <base-input v-model="form.person" disabled placeholder="???????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="takeDate">
                    <base-date-picker
                      v-model="form.takeDate"
                      disabled
                      type="datetime"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      format="yyyy-MM-dd HH:mm:ss"
                      placeholder="?????????????????????"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="takePerson">
                    <base-input v-model="form.takePerson" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="takeIdCard">
                    <base-input v-model="form.takeIdCard" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="??????" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="???????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--????????? -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ?????????
              </span>
              <div class="common-operate-block-body">
                <base-page
                  v-if="showPage"
                  ref="detailsRef"
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
                  :name="constant.TABLE_NAME_TAKE_NO_DETAILS"
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
  </div>
</template>

<style lang="scss" scoped>
.take-no {
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

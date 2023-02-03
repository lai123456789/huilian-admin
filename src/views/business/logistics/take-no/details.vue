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
    // 获取详情数据
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
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        { field: 'shippingNo', title: '出库编号' },
        {
          field: 'orderType',
          title: '订单类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SHIPPING_ORDER_TYPE)
            }
          }
        },
        { field: 'orderNo', title: '订单编号' },
        { field: 'customerName', title: '客户名称' },
        { field: 'totalQty', title: '总数量', sum: true, footerConfig: { precision: 6 } },
        { field: 'totalPackages', title: '总件数', sum: true, footerConfig: { precision: 6 } },
        { field: 'totalGrossWeight', title: '总毛重', sum: true, footerConfig: { precision: 6 } },
        { field: 'totalNetWeight', title: '	总净重', sum: true, footerConfig: { precision: 6 } },
        { field: 'deliveryAddress', title: '送货地址' },
        { field: 'deliveryCompany', title: '收货公司' },
        { field: 'deliveryIdCard', title: '收货人' },
        { field: 'deliveryPerson', title: '收货电话' },
        { field: 'remark', title: '备注' }
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
    // 修改某一项时，刷新列表页和详情页
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
          <base-form ref="formRef" :model="form" label-width="80px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="仓库" prop="warehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.warehouseName"
                      value-key="warehouseName"
                      disabled
                      label="仓库"
                      placeholder="请输入仓库"
                      :auto-assign="{
                        warehouseId: 'id'
                      }"
                      :form="form"
                    ></business-autocomplete-warehouse>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="车牌" prop="plateNo">
                    <base-input v-model="form.plateNo" disabled placeholder="请输入车牌" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="司机" prop="person">
                    <base-input v-model="form.person" disabled placeholder="请输入司机" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="自提时间" prop="takeDate">
                    <base-date-picker
                      v-model="form.takeDate"
                      disabled
                      type="datetime"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      format="yyyy-MM-dd HH:mm:ss"
                      placeholder="请选择自提时间"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="自提人" prop="takePerson">
                    <base-input v-model="form.takePerson" disabled placeholder="请输入自提人" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="身份证号" prop="takeIdCard">
                    <base-input v-model="form.takeIdCard" disabled placeholder="请输入身份证号" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="请输入备注" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--出库单 -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                出库单
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

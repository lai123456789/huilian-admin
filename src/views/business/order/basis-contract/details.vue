<script>
import { getOrderBasisContractById, getOrderBasisContractAuditList, auditOrderBasisContract } from '@/api/order/order-basis-contract'
import { getOrderBasisContractDetail } from '@/api/order/order-basis-contract-detail'
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
        contractNo: '',
        orderType: enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'),
        orderId: 0,
        orderNo: '',
        contractDate: '',
        totalMoney: 0,
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
        const { data } = await getOrderBasisContractDetail({
          ...pager,
          ...transforArrayPayload(params)
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getOrderBasisContractAuditList(this.tableRow.id),
        save: auditOrderBasisContract
      },
      showAuditDetailsBtn: false
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_BASIS_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_ORDER_TYPE } = constant
        Promise.all([getDataDictionary([DICTS_ORDER_TYPE]), getOrderBasisContractById(this.tableRow.id)]).then(([dicts, info]) => {
          const { createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_BASIS_EDIT],
            del: this.permissions[constant.PERMISSION_BASIS_DEL]
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
        { field: 'productName', title: '??????' },
        { field: 'productModel', title: '??????' },
        { field: 'productBrand', title: '??????' },
        { field: 'productUnit', title: '??????' },
        { field: 'qty', title: '??????' },
        {
          field: 'basis',
          title: '??????'
        },
        {
          field: 'point',
          title: '????????????'
        },
        {
          field: 'price',
          title: '????????????',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          },
          footerConfig: { precision: 6 },
          align: 'right'
        },
        {
          field: 'totalMoney',
          title: '????????????',
          formatter: {
            type: 'number'
          },
          align: 'right',
          sum: true
        },
        { field: 'remark', title: '??????', type: 'input' }
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
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate hg-truck is-details-adaptive"
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
                    <base-select
                      v-model="form.orderType"
                      disabled
                      placeholder="?????????????????????"
                      :clearable="false"
                      :options="dicts[constant.DICTS_ORDER_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="orderNo">
                    <business-autocomplete-basic
                      v-model="form.orderNo"
                      disabled
                      label="????????????"
                      placeholder="?????????????????????"
                      :params="{
                        auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS'),
                        basisFlag: enums.WHETHER_STATUS.getFieldByKey('YES')
                      }"
                      :module-name="constant.AUTOCOMPLETE_KEY_AGENT_PURCHASE_ORDER"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="??????????????????" prop="contractNo">
                    <base-input v-model="form.contractNo" disabled placeholder="???????????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="contractDate">
                    <base-date-picker v-model="form.contractDate" disabled type="date" placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled readonly />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="??????" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="???????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--?????????????????? -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ??????????????????
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
                  :name="constant.TABLE_NAME_BASIS_ORDER_DETAILS"
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
.hg-truck {
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

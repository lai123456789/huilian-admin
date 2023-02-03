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
    // 获取详情数据
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
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productUnit', title: '单位' },
        { field: 'qty', title: '数量' },
        {
          field: 'basis',
          title: '基差'
        },
        {
          field: 'point',
          title: '成交点位'
        },
        {
          field: 'price',
          title: '成交单价',
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
          title: '成交总价',
          formatter: {
            type: 'number'
          },
          align: 'right',
          sum: true
        },
        { field: 'remark', title: '备注', type: 'input' }
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
                    <base-select
                      v-model="form.orderType"
                      disabled
                      placeholder="请选择订单类型"
                      :clearable="false"
                      :options="dicts[constant.DICTS_ORDER_TYPE]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="订单编号" prop="orderNo">
                    <business-autocomplete-basic
                      v-model="form.orderNo"
                      disabled
                      label="订单编号"
                      placeholder="请输入订单编号"
                      :params="{
                        auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS'),
                        basisFlag: enums.WHETHER_STATUS.getFieldByKey('YES')
                      }"
                      :module-name="constant.AUTOCOMPLETE_KEY_AGENT_PURCHASE_ORDER"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="基差合同编号" prop="contractNo">
                    <base-input v-model="form.contractNo" disabled placeholder="请输入基差合同编号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="合同日期" prop="contractDate">
                    <base-date-picker v-model="form.contractDate" disabled type="date" placeholder="选择合同日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="成交总金额" prop="totalMoney">
                    <base-input-number v-model="form.totalMoney" disabled readonly />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" type="textarea" disabled placeholder="请输入备注" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--基差合同明细 -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基差合同明细
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

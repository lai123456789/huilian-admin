<script>
import { deleteAcctMakeInvoiceDiffById } from '@/api/finance/acct-make-invoice-diff'
import { getAcctMakeInvoiceDiffUse } from '@/api/finance/acct-make-invoice-diff-use'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
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
        orderNo: '',
        customerName: '',
        totalMoney: 0,
        deductMoney: 0,
        unDeductMoney: 0,
        beforeInvoiceMoney: 0,
        costInvoiceMoney: 0,
        remark: ''
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      statusForm: {
        deductStatus: ''
      },
      dicts: {},
      showPage: false,
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getAcctMakeInvoiceDiffUse({
          ...pager,
          ...transforArrayPayload(Object.assign({ invoiceDiffId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        constant
        Promise.all([getDataDictionary([]), deleteAcctMakeInvoiceDiffById(this.tableRow.id)]).then(([dicts, info]) => {
          const { deductStatus, createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }

          this.statusForm = {
            deductStatus
          }

          Object.assign(this.form, info.data)

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
        { field: 'totalMoney', title: '抵扣票差金额' },
        { field: 'deductDate', title: '抵扣日期' },
        { field: 'makeInvoiceNo', title: '销项票号' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ]
    },
    detailsReLoad(isClearSelect) {
      this.$refs['detailsRef'].refresh(isClearSelect)
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
    class="common-operate import-ticket-diff is-details-adaptive"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-main">
          <base-form ref="formRef" :model="form" label-width="110px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="订单编号" prop="orderNo">
                    <base-input v-model="form.orderNo" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="客户名称" prop="customerName">
                    <base-input v-model="form.customerName" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="票差金额" prop="totalMoney">
                    <base-input v-model="form.totalMoney" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="已抵扣票差金额" prop="deductMoney">
                    <base-input v-model="form.deductMoney" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="未抵扣票差金额" prop="unDeductMoney">
                    <base-input v-model="form.unDeductMoney" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="提前开票金额" prop="beforeInvoiceMoney">
                    <base-input v-model="form.beforeInvoiceMoney" disabled />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="实际应收金额" prop="costInvoiceMoney">
                    <base-input v-model="form.costInvoiceMoney" disabled />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--票差明细 -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                票差明细
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
                  :name="constant.TABLE_NAME_IMPORT_TICKET_DIFF_DETAILS"
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
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">抵扣状态:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.DEDUCT_STATUS.getFieldByValue(statusForm.deductStatus, 'color') }">
              {{ enums.DEDUCT_STATUS.getFieldByValue(statusForm.deductStatus) }}
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
    <div class="common-operate-b"></div>
  </div>
</template>

<style lang="scss" scoped>
.import-ticket-diff {
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

<script>
import {
  getCustomsTransportById,
  checkArrivedCustomsTransport,
  checkShippedCustomsTransport,
  checkRollBackCustomsTransport,
  getCustomsTransportAuditList,
  auditCustomsTransport
} from '@/api/customs/customs-transport'
import { getCustomsTransportContainer } from '@/api/customs/customs-transport-container'

import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'
import dayjs from '@/utils/day'

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
        tradingType: enums.IEF_LAG.getFieldByKey('IMPORT'),
        trafModeCode: enums.TRANSPORT_MODE.getFieldByKey('LAND'),
        trafModeName: enums.TRANSPORT_MODE.getFieldByKey('LAND', 'label'),
        trafName: '',
        transportDate: dayjs().format('YYYY-MM-DD'),
        carpoolFlag: enums.IS_CAR_POOLING.getFieldByKey('POOLING'),
        carType: '',
        carTrainNo: '',
        cargoListNo: '',
        entyPort: '',
        entyPortCode: void 0,
        startWarehouseId: 0,
        startWarehouseName: '',
        endWarehouseId: 0,
        endWarehouseName: '',
        expressId: 0,
        expressCompanyId: 0,
        expressName: '',
        plateNo: '',
        person: '',
        mobile: '',
        idCard: '',
        shipName: '',
        flightNo: '',
        soNo: '',
        deliveryNo: '',
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
        trafStatus: ''
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
      updateTransportStatusDropdownButtonOptions: [],
      request: async ({ pager, params }) => {
        const { data } = await getCustomsTransportContainer({
          ...pager,
          ...transforArrayPayload(Object.assign({ transportId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      requestApi: {
        list: () => getCustomsTransportAuditList(this.tableRow.id),
        save: auditCustomsTransport
      },
      showAuditDetailsBtn: false
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_HG_TRUCK_AUDIT]
    this.updateTransportStatusDropdownButtonOptions = [
      {
        label: '运输中',
        visible: this.permissions[constant.PERMISSION_HG_CHECK_SHIPPED],
        handler: () => this.handleCustomsTransportStatus('checkShipped')
      },
      {
        label: '已到货',
        visible: this.permissions[constant.PERMISSION_HG_CHECK_ARRIVED],
        handler: () => this.handleCustomsTransportStatus('checkArrived')
      },
      {
        label: '状态撤回',
        visible: this.permissions[constant.PERMISSION_HG_CHECK_ROLL_BACK],
        handler: () => this.handleCustomsTransportStatus('checkRollBack')
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_IEF_LAG, DICTS_WHETHER_STATUS, DICTS_HIRING_TAXIE_TYPE, DICTS_TRAIN_TYPE, DICTS_TRAF_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_IEF_LAG, DICTS_WHETHER_STATUS, DICTS_HIRING_TAXIE_TYPE, DICTS_TRAIN_TYPE, DICTS_TRAF_STATUS]),
          getCustomsTransportById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { trafStatus, createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }
          this.statusForm = {
            trafStatus
          }
          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_HG_TRUCK_EDIT],
            del: this.permissions[constant.PERMISSION_HG_TRUCK_DEL]
          }

          this.columns = this.handleDetailsColumns()

          if (isFunction(cb)) cb()
          this.showPage = true
          this.loading = false
        })
      })
    },
    async handleCustomsTransportStatus(type) {
      switch (type) {
        case 'checkShipped':
          await checkShippedCustomsTransport(this.tableRow.id)
          break
        case 'checkArrived':
          await checkArrivedCustomsTransport(this.tableRow.id)
          break
        case 'checkRollBack':
          await checkRollBackCustomsTransport(this.tableRow.id)
          break
      }
      this.getDetailsData(() => {
        this.$message.success('操作成功')
      })
    },
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        { field: 'containerNo', title: '集装箱号' },
        {
          field: 'containerType',
          title: '集装箱规格'
        },
        {
          field: 'weight',
          title: '自重(kg)',
          formatter: {
            type: 'number',
            config: {
              precision: 4
            }
          }
        },
        {
          field: 'lclFlag',
          title: '拼箱标识',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        }
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
                  <base-form-item label="进出口标志" prop="tradingType">
                    <base-select
                      v-model="form.tradingType"
                      disabled
                      :clearable="false"
                      placeholder="请选择进出口标志"
                      :options="dicts[constant.DICTS_IEF_LAG]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="运输日期" prop="transportDate">
                    <base-date-picker v-model="form.transportDate" disabled placeholder="请选择运输日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="运输方式" prop="trafModeName">
                    <business-autocomplete-ccl
                      v-model="form.trafModeName"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSPORT"
                      disabled
                      label="运输方式"
                      placeholder="请选择运输方式"
                      value-key="name"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="运输工具" prop="trafName">
                    <base-input v-model="form.trafName" disabled placeholder="请输入运输工具" />
                  </base-form-item>
                </base-col>

                <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('LAND')">
                  <base-col :span="6">
                    <base-form-item label="是否拼车" prop="carpoolFlag">
                      <base-select
                        v-model="form.carpoolFlag"
                        disabled
                        placeholder="请选择是否拼车"
                        :clearable="false"
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="订车类型" prop="carType">
                      <base-select
                        v-model="form.carType"
                        disabled
                        placeholder="请选择订车类型"
                        :clearable="false"
                        :options="dicts[constant.DICTS_HIRING_TAXIE_TYPE]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="车次类型" prop="carTrainNo">
                      <base-select
                        v-model="form.carTrainNo"
                        disabled
                        placeholder="请选择车次类型"
                        :clearable="false"
                        :options="dicts[constant.DICTS_TRAIN_TYPE]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="载货清单号" prop="cargoListNo">
                      <base-input v-model="form.cargoListNo" disabled placeholder="请输入载货清单号" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col :span="6">
                  <base-form-item label="出入境口岸" prop="entyPort">
                    <business-autocomplete-ccl
                      v-model="form.entyPort"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE"
                      disabled
                      label="出入境口岸"
                      placeholder="请选择出入境口岸"
                      value-key="name"
                      :auto-assign="{
                        entyPortCode: 'code'
                      }"
                      :form="form"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="始发仓" prop="startWarehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.startWarehouseName"
                      label="始发仓"
                      disabled
                      value-key="warehouseName"
                      placeholder="请选择始发仓"
                      :auto-assign="{
                        startWarehouseId: 'id'
                      }"
                      :form="form"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="目的仓" prop="endWarehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.endWarehouseName"
                      label="目的仓"
                      placeholder="请选择目的仓"
                      disabled
                      value-key="warehouseName"
                      :auto-assign="{
                        endWarehouseId: 'id'
                      }"
                      :form="form"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="运输公司" prop="expressName">
                    <business-autocomplete-basic
                      v-model="form.expressName"
                      label="运输公司"
                      placeholder="请输入运输公司"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_TRANSPORT"
                    />
                  </base-form-item>
                </base-col>

                <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('LAND')">
                  <base-col :span="6">
                    <base-form-item label="车牌" prop="plateNo">
                      <business-autocomplete-vehicle
                        v-model="form.plateNo"
                        label="车牌号码"
                        disabled
                        placeholder="请输入车牌"
                        :value-key="form.tradingType === enums.IEF_LAG.getFieldByKey('IMPORT') ? 'plateNo' : 'plateNoHk'"
                        :params="{
                          companyId: form.expressCompanyId,
                          tradingType: form.tradingType,
                          carType: form.carType
                        }"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="司机" prop="person">
                      <business-autocomplete-vehicle
                        v-model="form.person"
                        disabled
                        label="司机"
                        placeholder="请输入司机"
                        value-key="person"
                        :params="{
                          companyId: form.expressCompanyId,
                          tradingType: form.tradingType,
                          carType: form.carType
                        }"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="司机电话" prop="mobile">
                      <base-input v-model="form.mobile" disabled placeholder="请输入司机电话" />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="身份证号" prop="idCard">
                      <base-input v-model="form.idCard" disabled placeholder="请输入身份证号" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME')" :span="6">
                  <base-form-item label="船名" prop="shipName">
                    <base-input v-model="form.shipName" disabled placeholder="请输入船名" />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('AIR')" :span="6">
                  <base-form-item label="航班号" prop="flightNo">
                    <base-input v-model="form.flightNo" disabled placeholder="请输入航班号" />
                  </base-form-item>
                </base-col>

                <base-col
                  v-if="
                    form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME') ||
                    form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('AIR')
                  "
                  :span="6"
                >
                  <base-form-item label="航次号" prop="cargoListNo">
                    <base-input v-model="form.cargoListNo" disabled placeholder="请输入航次号" />
                  </base-form-item>
                </base-col>

                <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME')">
                  <base-col :span="6">
                    <base-form-item label="SO号" prop="soNo">
                      <base-input v-model="form.soNo" disabled placeholder="请输入SO号" />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="提单号" prop="deliveryNo">
                      <base-input v-model="form.deliveryNo" disabled placeholder="请输入提单号" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col :span="12">
                  <base-form-item label="备注" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="请输入备注" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--集装箱列表 -->
            <div
              v-if="
                form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME') ||
                form.carType === enums.CAR_TYPE.getFieldByKey('TANK')
              "
              class="common-operate-block is-special"
            >
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                集装箱列表
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
                  :name="constant.TABLE_NAME_HG_TRUCK_DETAILS"
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
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">运输状态:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.TRAF_STATUS.getFieldByValue(statusForm.trafStatus, 'color') }">
              {{ enums.TRAF_STATUS.getFieldByValue(statusForm.trafStatus) }}
            </div>
          </div>

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
        <business-dropdown-button
          v-if="form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')"
          :options="updateTransportStatusDropdownButtonOptions"
          >变更运输状态</business-dropdown-button
        >
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

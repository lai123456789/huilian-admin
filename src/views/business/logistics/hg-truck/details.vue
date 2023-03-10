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
        label: '?????????',
        visible: this.permissions[constant.PERMISSION_HG_CHECK_SHIPPED],
        handler: () => this.handleCustomsTransportStatus('checkShipped')
      },
      {
        label: '?????????',
        visible: this.permissions[constant.PERMISSION_HG_CHECK_ARRIVED],
        handler: () => this.handleCustomsTransportStatus('checkArrived')
      },
      {
        label: '????????????',
        visible: this.permissions[constant.PERMISSION_HG_CHECK_ROLL_BACK],
        handler: () => this.handleCustomsTransportStatus('checkRollBack')
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
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
        this.$message.success('????????????')
      })
    },
    /** ??????????????? */
    handleDetailsColumns() {
      return [
        { field: 'containerNo', title: '????????????' },
        {
          field: 'containerType',
          title: '???????????????'
        },
        {
          field: 'weight',
          title: '??????(kg)',
          formatter: {
            type: 'number',
            config: {
              precision: 4
            }
          }
        },
        {
          field: 'lclFlag',
          title: '????????????',
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
                  <base-form-item label="???????????????" prop="tradingType">
                    <base-select
                      v-model="form.tradingType"
                      disabled
                      :clearable="false"
                      placeholder="????????????????????????"
                      :options="dicts[constant.DICTS_IEF_LAG]"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="transportDate">
                    <base-date-picker v-model="form.transportDate" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="trafModeName">
                    <business-autocomplete-ccl
                      v-model="form.trafModeName"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSPORT"
                      disabled
                      label="????????????"
                      placeholder="?????????????????????"
                      value-key="name"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="????????????" prop="trafName">
                    <base-input v-model="form.trafName" disabled placeholder="?????????????????????" />
                  </base-form-item>
                </base-col>

                <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('LAND')">
                  <base-col :span="6">
                    <base-form-item label="????????????" prop="carpoolFlag">
                      <base-select
                        v-model="form.carpoolFlag"
                        disabled
                        placeholder="?????????????????????"
                        :clearable="false"
                        :options="dicts[constant.DICTS_WHETHER_STATUS]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="????????????" prop="carType">
                      <base-select
                        v-model="form.carType"
                        disabled
                        placeholder="?????????????????????"
                        :clearable="false"
                        :options="dicts[constant.DICTS_HIRING_TAXIE_TYPE]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="????????????" prop="carTrainNo">
                      <base-select
                        v-model="form.carTrainNo"
                        disabled
                        placeholder="?????????????????????"
                        :clearable="false"
                        :options="dicts[constant.DICTS_TRAIN_TYPE]"
                      />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="???????????????" prop="cargoListNo">
                      <base-input v-model="form.cargoListNo" disabled placeholder="????????????????????????" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col :span="6">
                  <base-form-item label="???????????????" prop="entyPort">
                    <business-autocomplete-ccl
                      v-model="form.entyPort"
                      :module-name="constant.AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE"
                      disabled
                      label="???????????????"
                      placeholder="????????????????????????"
                      value-key="name"
                      :auto-assign="{
                        entyPortCode: 'code'
                      }"
                      :form="form"
                    ></business-autocomplete-ccl>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="startWarehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.startWarehouseName"
                      label="?????????"
                      disabled
                      value-key="warehouseName"
                      placeholder="??????????????????"
                      :auto-assign="{
                        startWarehouseId: 'id'
                      }"
                      :form="form"
                    />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="?????????" prop="endWarehouseName">
                    <business-autocomplete-warehouse
                      v-model="form.endWarehouseName"
                      label="?????????"
                      placeholder="??????????????????"
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
                  <base-form-item label="????????????" prop="expressName">
                    <business-autocomplete-basic
                      v-model="form.expressName"
                      label="????????????"
                      placeholder="?????????????????????"
                      disabled
                      :module-name="constant.AUTOCOMPLETE_KEY_TRANSPORT"
                    />
                  </base-form-item>
                </base-col>

                <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('LAND')">
                  <base-col :span="6">
                    <base-form-item label="??????" prop="plateNo">
                      <business-autocomplete-vehicle
                        v-model="form.plateNo"
                        label="????????????"
                        disabled
                        placeholder="???????????????"
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
                    <base-form-item label="??????" prop="person">
                      <business-autocomplete-vehicle
                        v-model="form.person"
                        disabled
                        label="??????"
                        placeholder="???????????????"
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
                    <base-form-item label="????????????" prop="mobile">
                      <base-input v-model="form.mobile" disabled placeholder="?????????????????????" />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="????????????" prop="idCard">
                      <base-input v-model="form.idCard" disabled placeholder="?????????????????????" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME')" :span="6">
                  <base-form-item label="??????" prop="shipName">
                    <base-input v-model="form.shipName" disabled placeholder="???????????????" />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('AIR')" :span="6">
                  <base-form-item label="?????????" prop="flightNo">
                    <base-input v-model="form.flightNo" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <base-col
                  v-if="
                    form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME') ||
                    form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('AIR')
                  "
                  :span="6"
                >
                  <base-form-item label="?????????" prop="cargoListNo">
                    <base-input v-model="form.cargoListNo" disabled placeholder="??????????????????" />
                  </base-form-item>
                </base-col>

                <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME')">
                  <base-col :span="6">
                    <base-form-item label="SO???" prop="soNo">
                      <base-input v-model="form.soNo" disabled placeholder="?????????SO???" />
                    </base-form-item>
                  </base-col>

                  <base-col :span="6">
                    <base-form-item label="?????????" prop="deliveryNo">
                      <base-input v-model="form.deliveryNo" disabled placeholder="??????????????????" />
                    </base-form-item>
                  </base-col>
                </template>

                <base-col :span="12">
                  <base-form-item label="??????" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="???????????????" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--??????????????? -->
            <div
              v-if="
                form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME') ||
                form.carType === enums.CAR_TYPE.getFieldByKey('TANK')
              "
              class="common-operate-block is-special"
            >
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                ???????????????
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
          <el-divider content-position="left">??????</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.TRAF_STATUS.getFieldByValue(statusForm.trafStatus, 'color') }">
              {{ enums.TRAF_STATUS.getFieldByValue(statusForm.trafStatus) }}
            </div>
          </div>

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
        <business-dropdown-button
          v-if="form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')"
          :options="updateTransportStatusDropdownButtonOptions"
          >??????????????????</business-dropdown-button
        >
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

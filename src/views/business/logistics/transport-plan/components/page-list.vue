<!-- 跨境订车计划 -->
<script>
import { getCustomsImportReserveCar } from '@/api/customs/customs-import-reserve-car'
import { getCustomsExportReserveCar } from '@/api/customs/customs-export-reserve-car'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import Drawer from './drawer'
import CreateHgTruck from './create-hg-truck'
import { jumpCorresOrder } from '@/utils/jump'

export default {
  name: 'TransportPlanPageList',
  components: { Drawer, CreateHgTruck },
  props: {
    orderType: String,
    permissionObj: Object
  },
  data() {
    return {
      enums,
      constant,
      details: {
        visible: false,
        title: ''
      },
      createHgTruck: {
        visible: false,
        row: {}
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const payload = Object.assign({ auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS') }, params)
        let pageData
        if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
          const { data } = await getCustomsImportReserveCar({
            ...pager,
            ...transforArrayPayload(payload)
          })
          pageData = data
        } else {
          const { data } = await getCustomsExportReserveCar({
            ...pager,
            ...transforArrayPayload(payload)
          })
          pageData = data
        }
        return {
          data: pageData.records,
          total: pageData.total
        }
      },
      columns: [
        { field: 'transportNo', title: '运输单号', searchProps: true, link: { name: constant.ROUTE_HG_TRUCK, toField: true } },
        {
          field: 'trafStatus',
          title: '运输状态',
          searchProps: { type: 'select' },
          color: value => {
            return enums.TRAF_STATUS.getFieldByValue(value, 'color')
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRAF_STATUS)
            }
          }
        },
        { field: 'entyPort', title: this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT') ? '入境口岸' : '离境口岸' },
        {
          field: 'orderNo',
          title: '订单编号',
          searchProps: { sort: 1 },
          link: row => jumpCorresOrder(row, this, this.orderType)
        },
        { field: 'transportDate', title: '运输日期' },
        {
          field: 'carpoolFlag',
          title: '是否拼车',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'trafModeName', title: '运输方式' },
        {
          field: 'carType',
          title: '订车类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_HIRING_TAXIE_TYPE)
            }
          }
        },
        {
          field: 'carTrainNo',
          title: '车次类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRAIN_TYPE)
            }
          }
        },
        { field: 'endWarehouseName', title: '目的仓', searchProps: true, link: { name: constant.ROUTE_WAREHOUSE, toField: 'warehouse' } },
        { field: 'expressName', title: '运输公司', searchProps: true, link: { name: constant.ROUTE_TRAN_DRIVER, toField: 'companyName' } },
        { field: 'plateNo', title: '车牌号码', searchProps: true },
        { field: 'person', title: '司机姓名', searchProps: true },
        { field: 'mobile', title: '司机电话' },
        { field: 'idCard', title: '身份证号' },
        { field: 'shipName', title: '船名' },
        { field: 'flightNo', title: '航班号' },
        { field: 'cargoListNo', title: '载货清单号/航次号', searchProps: true },
        { field: 'remark', title: '备注', searchProps: true },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[this.permissions[this.permissionObj.page]],
      mark: this.permissions[this.permissionObj.page]
    }
    this.buttonsConfig = {
      mores: [
        {
          label: '生成报关运输单',
          visible: this.permissions[this.permissionObj.create],
          handler: row => this.handleCreateHgTruck(row)
        }
      ]
    }
  },
  methods: {
    handleCreateHgTruck(rows) {
      this.createHgTruck = {
        visible: true,
        row: rows[0]
      }
    },
    openDetails({ row }) {
      const { orderNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: orderNo
      }
    },
    // 详情编辑保存会执行该方法
    handleEditDetailsTitle(form) {
      // 进口订单编号系统编码的状态为禁用时，详情页标题取客户合同号字段，反之取订单编号字段
      this.details.title = form.isCusOrderNoRequired ? form.cusOrderNo : form.orderNo
    },
    reLoad(isClearSelect) {
      this.$refs['transportPlanPageListRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="transport-plan-page-list">
    <!-- 列表页 -->
    <base-page
      ref="transportPlanPageListRef"
      key-field="orderId"
      :name="
        orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
          ? constant.TABLE_NAME_TRANSPORT_PLAN_IMPORT
          : constant.TABLE_NAME_TRANSPORT_PLAN_EXPORT
      "
      show-footer
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '105px'
      }"
      @cell-dblclick="openDetails"
    />
    <drawer
      :visible.sync="details.visible"
      :order-type="orderType"
      :title="details.title"
      :table-row="tableRow"
      :re-load="reLoad"
      @edit-details-title="handleEditDetailsTitle"
    ></drawer>
    <create-hg-truck v-model="createHgTruck.visible" :trading-type="orderType" :extra-payload="createHgTruck.row" :re-load="reLoad" />
  </div>
</template>

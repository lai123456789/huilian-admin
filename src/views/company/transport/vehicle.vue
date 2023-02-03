<!-- 车辆 -->
<script>
import { getCompanyTranVehicle, deleteCompanyTranVehicleById } from '@/api/company/company-tran-vehicle'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormVehicle from './components/enter-form-vehicle'
import { mapGetters } from 'vuex'

export default {
  name: 'Vehicle',
  components: { EnterFormVehicle },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCompanyTranVehicle({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                customerId: this.tableRow.id,
                companyId: this.tableRow.companyId
              },
              params
            )
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'plateNo', title: '大陆车牌', searchProps: true },
        { field: 'plateNoHk', title: '香港车牌', searchProps: true },
        { field: 'tonnage', title: '吨位' },
        { field: 'maxPayload', title: '最大载重' },
        { field: 'recordNo', title: '备案号' },
        { field: 'person', title: '司机', searchProps: true },
        { field: 'mobile', title: '手机号' },
        { field: 'idCard', title: '身份证号' },
        { field: 'sort', title: '排序' },
        { field: 'remark', title: '备注' },
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
      show: this.permissions[constant.PERMISSION_TRANSPORT_VEHICLE],
      mark: constant.PERMISSION_TRANSPORT_VEHICLE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_TRANSPORT_VEHICLE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_TRANSPORT_VEHICLE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_TRANSPORT_VEHICLE_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteCompanyTranVehicleById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['vehicleRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['vehicleRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="vehicle">
    <!-- 列表页 -->
    <base-page
      ref="vehicleRef"
      :name="constant.TABLE_NAME_TRANSPORT_VEHICLE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form-vehicle v-model="enterForm.visible" :type="enterForm.type" :main-row="mainRow" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>

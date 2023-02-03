<!-- 司机 -->
<script>
import { getCompanyTranDriver, deleteCompanyTranDriverById } from '@/api/company/company-tran-driver'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormDriver from './components/enter-form-driver'
import { mapGetters } from 'vuex'

export default {
  name: 'Driver',
  components: { EnterFormDriver },
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
        const { data } = await getCompanyTranDriver({
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
        { field: 'person', title: '司机', searchProps: true },
        { field: 'mobile', title: '手机号' },
        { field: 'idCard', title: '身份证号' },
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
      show: this.permissions[constant.PERMISSION_TRANSPORT_DRIVER],
      mark: constant.PERMISSION_TRANSPORT_DRIVER
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_TRANSPORT_DRIVER_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_TRANSPORT_DRIVER_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_TRANSPORT_DRIVER_DEL],
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
          deleteCompanyTranDriverById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['driverRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['driverRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="driver">
    <!-- 列表页 -->
    <base-page
      ref="driverRef"
      :name="constant.TABLE_NAME_TRANSPORT_DRIVER"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form-driver v-model="enterForm.visible" :type="enterForm.type" :main-row="mainRow" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>

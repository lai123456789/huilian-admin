<!-- 仓库 -->
<script>
import { getBaseWareHouse, deleteBaseWareHouseById } from '@/api/base/base-ware-house'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'Warehouse',
  components: { EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getBaseWareHouse({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'status',
          title: '状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ENANLE_DISABLE)
            }
          }
        },
        { field: 'warehouseName', title: '仓库名称', searchProps: true },
        { field: 'warehouseAddress', title: '仓库地址' },
        {
          field: 'region',
          title: '所属区域',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COMPANY_REGION)
            }
          }
        },
        { field: 'person', title: '管理人' },
        { field: 'mobile', title: '手机号' },
        { field: 'phone', title: '座机' },
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
      show: this.permissions[constant.PERMISSION_BASE_WM],
      mark: constant.PERMISSION_BASE_WM
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASE_WM_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_WM_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_WM_DEL],
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
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteBaseWareHouseById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['warehouseRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['warehouseRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="warehouse">
    <!-- 列表页 -->
    <base-page
      ref="warehouseRef"
      :name="constant.TABLE_NAME_WAREHOUSE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>

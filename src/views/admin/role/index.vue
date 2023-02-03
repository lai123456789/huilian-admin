<!-- 角色管理 -->
<script>
import { getRole, deleteRoleById } from '@/api/admin/role'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import TreeTable from './components/tree-table'
import { mapGetters } from 'vuex'

export default {
  name: 'Role',
  components: { EnterForm, TreeTable },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      treeTable: {
        visible: false,
        row: {}
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getRole({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'roleName', title: '角色名称', searchProps: true },
        { field: 'roleCode', title: '角色标识', searchProps: true },
        { field: 'roleDesc', title: '角色描述' },
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
      show: this.permissions[constant.PERMISSION_SYS_ROLE],
      mark: constant.PERMISSION_SYS_ROLE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_ROLE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_ROLE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_ROLE_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '设置权限',
          visible: this.permissions[constant.PERMISSION_SYS_ROLE_PERM],
          handler: this.handlePermission
        }
      ]
    }
  },
  methods: {
    handlePermission(row) {
      this.treeTable = {
        visible: true,
        row: row[0]
      }
    },
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
          deleteRoleById(row.roleId).then(() => {
            // 清空表格全部选中的数据
            this.$refs['roleRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['roleRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="role">
    <!-- 列表页 -->
    <base-page
      ref="roleRef"
      :name="constant.TABLE_NAME_SYS_ROLE"
      key-field="roleId"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <tree-table v-model="treeTable.visible" :table-row="treeTable.row" />
  </div>
</template>

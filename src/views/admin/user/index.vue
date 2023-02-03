<!-- 用户管理 -->
<script>
import { getUser, deleteUserById } from '@/api/admin/user'
import { getDeptTree } from '@/api/admin/dept'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { throttle } from 'xe-utils'

export default {
  name: 'User',
  components: { EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      params: {},
      request: async ({ pager, params }) => {
        const { data } = await getUser({ ...pager, ...transforArrayPayload(Object.assign(this.params, params)) })
        return {
          data: data.records.map(v => {
            const roles = v.roleList.map(v => v.roleName).join('、')
            return { ...v, roles }
          }),
          total: data.total
        }
      },
      columns: [
        { field: 'realname', title: '姓名', searchProps: true },
        { field: 'username', title: '用户名' },
        { field: 'deptName', title: '部门' },
        {
          field: 'sex',
          title: '性别',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SEX)
            }
          }
        },
        { field: 'phone', title: '手机号' },
        { field: 'roles', title: '角色', textMaxColumnWidth: 300 },
        {
          field: 'lockFlag',
          title: '状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_LOCK_FLAG)
            }
          }
        },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {},
      deptName: '',
      currentDeptId: 0,
      depts: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  watch: {
    deptName(val) {
      this.$refs.treeRef.filter(val)
    }
  },
  created() {
    this.getDepts()
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_SYS_USER],
      mark: constant.PERMISSION_SYS_USER
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_USER_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_USER_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_USER_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    async getDepts() {
      const { data: depts } = await getDeptTree()
      this.depts = depts
      this.currentDeptId = depts[0].id
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
          deleteUserById(row.userId).then(() => {
            // 清空表格全部选中的数据
            this.$refs['sysUserRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    handleNodeClick: throttle(function (dept) {
      this.params = { deptId: dept.id }
      this.$refs['sysUserRef'].handleTableClearCheckbox(true)
      this.reLoad(false)
    }, 500),
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    reLoad(isClearSelect) {
      this.$refs['sysUserRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="sys-user">
    <div class="dept-tree">
      <base-input v-model="deptName" class="deptname-search" size="small" placeholder="请输入部门名称" prefix-icon="el-icon-search" />
      <div class="dept-tree-inner">
        <el-tree ref="treeRef" :data="depts" :props="defaultProps" :filter-node-method="filterNode" @node-click="handleNodeClick" />
      </div>
    </div>
    <div class="table-page">
      <!-- 列表页 -->
      <base-page
        ref="sysUserRef"
        :name="constant.TABLE_NAME_SYS_USER"
        key-field="userId"
        :columns="columns"
        :request="request"
        :help-config="helpConfig"
        :buttons-config="buttonsConfig"
      />
    </div>
    <enter-form
      v-model="enterForm.visible"
      :type="enterForm.type"
      :table-row="tableRow"
      :re-load="reLoad"
      :dept-obj="{
        deptId: currentDeptId,
        depts
      }"
    />
  </div>
</template>

<style lang="scss" scoped>
.sys-user {
  position: relative;
  .dept-tree {
    padding: 10px 20px 0 10px;
    width: 250px;
    .deptname-search {
      margin-bottom: 10px;
      width: 100%;
    }
  }
  .table-page {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 250px;
  }
  .tree-select {
    margin-bottom: 15px;
  }
  .role-select {
    & ::v-deep .el-input__suffix {
      /* 转动箭头的时候，影响组件宽度 */
      overflow: hidden;
    }
  }
}
</style>

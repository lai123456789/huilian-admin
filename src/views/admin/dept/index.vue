<script>
import { getDeptTree, deleteDeptById } from '@/api/admin/dept'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'Dept',
  components: { EnterForm },
  data() {
    return {
      enums,
      tableData: [],
      loading: false,
      permissionBtn: {
        add: false,
        edit: false,
        del: false
      },
      tableRow: {},
      parentId: void 0,
      enterForm: {
        visible: false,
        type: ''
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.permissionBtn = {
      add: this.permissions[constant.PERMISSION_SYS_DEPT_ADD],
      edit: this.permissions[constant.PERMISSION_SYS_DEPT_EDIT],
      del: this.permissions[constant.PERMISSION_SYS_DEPT_DEL]
    }
    this.getRecords()
  },
  methods: {
    getRecords() {
      this.loading = true
      getDeptTree().then(({ data }) => {
        this.tableData = data || []
        this.loading = false
      })
    },
    handleAdded(parentId) {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
      this.parentId = parentId !== void 0 ? parentId : 0
      this.$refs.enterFormRef.getTreeSelectRecords(this.tableData)
    },
    handleEdit({ id }) {
      this.tableRow = { id }
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
      this.$refs.enterFormRef.getTreeSelectRecords(this.tableData)
    },
    handleDelete({ name, id }) {
      this.$confirm(`是否确认删除名称为"${name}"的数据项?`).then(() => {
        deleteDeptById(id).then(() => {
          this.getRecords()
          this.$message.success('删除成功')
        })
      })
    }
  }
}
</script>

<template>
  <div class="dept">
    <div class="dept-btns">
      <el-button v-if="permissionBtn.add" class="dept-top-btn" type="primary" size="mini" @click="handleAdded(void 0)">新增</el-button>
    </div>
    <div
      v-loading="loading"
      class="dept-table"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-table :data="tableData" size="mini" border row-key="id" height="100%" :tree-props="{ children: 'children' }">
        <el-table-column prop="name" label="部门名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="sort" label="排序" align="center"></el-table-column>
        <el-table-column prop="isLock" label="有无权限" align="center">
          <template slot-scope="{ row }">
            <el-tag v-if="row.type" size="mini" type="success">是</el-tag>
            <el-tag v-else size="mini" type="danger">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{ row }">
            <el-button v-if="permissionBtn.add" type="text" icon="el-icon-plus" size="mini" @click="handleAdded(row.id)">新增</el-button>
            <el-button v-if="permissionBtn.edit" type="text" icon="el-icon-edit" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="permissionBtn.del" type="text" icon="el-icon-delete" size="mini" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <enter-form
      ref="enterFormRef"
      v-model="enterForm.visible"
      :type="enterForm.type"
      :table-row="tableRow"
      :parent-id="parentId"
      :re-load="getRecords"
    />
  </div>
</template>

<style lang="scss" scoped>
.dept {
  display: flex;
  padding: 10px;
  flex-direction: column;
  &-table {
    flex: 1;
    height: 0;
    ::v-deep .el-table {
      th.el-table__cell {
        background-color: #f8f8f9;
      }
    }
  }
  ::v-deep .el-button {
    &.dept-top-btn {
      margin-bottom: 10px;
    }
  }
}
</style>

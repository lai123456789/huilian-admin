<script>
import { getMenuTree, deleteMenuById } from '@/api/admin/menu'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import ViewRules from './components/view-rules'
import ViewButton from './components/view-button'
import { mapGetters } from 'vuex'

export default {
  name: 'Menu',
  components: { EnterForm, ViewRules, ViewButton },
  data() {
    return {
      enums,
      tableData: [],
      loading: false,
      permissionBtn: {
        add: false,
        edit: false,
        del: false,
        rules: false
      },
      tableRow: {},
      parentId: void 0,
      enterForm: {
        visible: false,
        type: ''
      },
      ruleRow: {},
      rule: {
        visible: false
      },
      viewButton: {
        visible: false,
        row: {}
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.permissionBtn = {
      add: this.permissions[constant.PERMISSION_SYS_MENU_ADD],
      edit: this.permissions[constant.PERMISSION_SYS_MENU_EDIT],
      del: this.permissions[constant.PERMISSION_SYS_MENU_DEL],
      rules: this.permissions[constant.PERMISSION_SYS_MENU_RULES]
    }
    this.getRecords()
  },
  methods: {
    getRecords() {
      this.loading = true
      getMenuTree({ types: [enums.MENU_TYPE.getFieldByKey('MENU'), enums.MENU_TYPE.getFieldByKey('TABS')].join(',') }).then(({ data }) => {
        this.tableData = data || []
        this.loading = false
      })
    },
    handleAdded(parentId) {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
      this.parentId = parentId !== void 0 ? parentId : '-1'
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
      this.$confirm(`???????????????????????????"${name}"?????????????`).then(() => {
        deleteMenuById(id).then(() => {
          this.getRecords()
          this.$message.success('????????????')
        })
      })
    },
    handleRule(row) {
      this.rule.visible = true
      this.ruleRow = row
    },
    handleViewButton(row) {
      this.viewButton = {
        visible: true,
        row
      }
    }
  }
}
</script>

<template>
  <div class="menu">
    <div class="menu-btns">
      <el-button v-if="permissionBtn.add" class="menu-top-btn" type="primary" size="mini" @click="handleAdded(void 0)">??????</el-button>
    </div>
    <div
      v-loading="loading"
      class="menu-table"
      element-loading-text="???????????????"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-table :data="tableData" size="mini" border row-key="id" height="100%" :tree-props="{ children: 'children' }">
        <el-table-column prop="name" label="????????????" min-width="120" show-overflow-tooltip width="220"></el-table-column>
        <el-table-column prop="icon" label="??????" align="center" width="70">
          <template slot-scope="scope">
            <i :class="['scp-font', scope.row.icon]" />
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="??????" align="center" width="80"></el-table-column>
        <el-table-column prop="path" label="????????????" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="url" label="????????????" width="160" show-overflow-tooltip></el-table-column>
        <el-table-column prop="type" label="??????" width="90" align="center">
          <template slot-scope="{ row }">
            <el-tag v-if="row.type === enums.MENU_TYPE.getFieldByKey('MENU')" size="mini" type="success">??????</el-tag>
            <el-tag v-if="row.type === enums.MENU_TYPE.getFieldByKey('BTN_PERMISSION')" size="mini" type="info">??????/??????</el-tag>
            <el-tag v-if="row.type === enums.MENU_TYPE.getFieldByKey('TABS')" size="mini" type="primary">??????</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permission" min-width="120" align="center" label="????????????" show-overflow-tooltip></el-table-column>
        <el-table-column prop="openMode" width="80" align="center" label="????????????">
          <template slot-scope="{ row }">
            <template v-if="row.type === enums.MENU_TYPE.getFieldByKey('MENU')">
              <el-tag v-if="row.openMode === enums.OPEN_MODE.getFieldByKey('INTERNAL')" size="mini" type="success">??????</el-tag>
              <el-tag v-if="row.openMode === enums.OPEN_MODE.getFieldByKey('EXTERNAL')" size="mini" type="info">??????</el-tag>
            </template>
            <span v-else> - </span>
          </template>
        </el-table-column>
        <el-table-column label="??????" align="center" width="340">
          <template slot-scope="{ row }">
            <el-button v-if="permissionBtn.add" type="text" icon="el-icon-plus" size="mini" @click="handleAdded(row.id)">??????</el-button>
            <el-button v-if="permissionBtn.edit" type="text" icon="el-icon-edit" size="mini" @click="handleEdit(row)">??????</el-button>
            <el-button v-if="permissionBtn.del" type="text" icon="el-icon-delete" size="mini" @click="handleDelete(row)">??????</el-button>
            <el-button v-if="permissionBtn.rules" type="text" icon="el-icon-paperclip" size="mini" @click="handleRule(row)"
              >????????????</el-button
            >
            <el-button type="text" icon="el-icon-paperclip" size="mini" @click="handleViewButton(row)">????????????</el-button>
          </template>
        </el-table-column>
        <template slot="empty">
          <base-empty />
        </template>
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
    <view-rules v-model="rule.visible" :row="ruleRow" />
    <view-button v-model="viewButton.visible" :table-row="viewButton.row" />
  </div>
</template>

<style lang="scss" scoped>
.menu {
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
    &.menu-top-btn {
      margin-bottom: 10px;
    }
  }
}
</style>

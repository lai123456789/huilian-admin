<!-- 查看按钮 -->
<script>
import { getMenuTree, deleteMenuById } from '@/api/admin/menu'
import constant from '@/constant'
import enums from '@/enums'
import ViewRules from './view-rules'
import { mapGetters } from 'vuex'
import EnterFormViewButton from './enter-form-view-button'

export default {
  name: 'ViewButton',
  components: { EnterFormViewButton, ViewRules },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: Object
  },
  data() {
    return {
      constant,
      visible: this.value,
      tableData: [],
      loading: false,
      permissionBtn: {
        add: false,
        edit: false,
        del: false,
        rules: false
      },
      mainRow: {},
      parentId: void 0,
      enterForm: {
        visible: false,
        type: ''
      },
      ruleRow: {},
      rule: {
        visible: false
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.getRecords()
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  created() {
    this.permissionBtn = {
      add: this.permissions[constant.PERMISSION_SYS_MENU_ADD],
      edit: this.permissions[constant.PERMISSION_SYS_MENU_EDIT],
      del: this.permissions[constant.PERMISSION_SYS_MENU_DEL],
      rules: this.permissions[constant.PERMISSION_SYS_MENU_RULES]
    }
  },
  methods: {
    getRecords() {
      this.loading = true
      getMenuTree({ types: enums.MENU_TYPE.getFieldByKey('BTN_PERMISSION'), parentId: this.tableRow.id }).then(({ data }) => {
        this.tableData = data || []
        this.loading = false
      })
    },
    handleAdded(parentId) {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
      this.parentId = parentId !== void 0 ? parentId : this.tableRow.id
      this.$refs.enterFormRef.getTreeSelectRecords(this.tableData, this.tableRow)
    },
    handleEdit({ id }) {
      this.mainRow = { id }
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
      this.$refs.enterFormRef.getTreeSelectRecords(this.tableData, this.tableRow)
    },
    handleDelete({ name, id }) {
      this.$confirm(`是否确认删除名称为"${name}"的数据项?`).then(() => {
        deleteMenuById(id).then(() => {
          this.getRecords()
          this.$message.success('删除成功')
        })
      })
    },
    handleRule(row) {
      this.rule.visible = true
      this.ruleRow = row
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="visible" custom-class="view-button-dialog" title="查看按钮" width="1200px" :show-footer="false">
    <div class="view-button-btns">
      <el-button v-if="permissionBtn.add" class="view-button-top-btn" type="primary" size="mini" @click="handleAdded(void 0)"
        >新增</el-button
      >
    </div>
    <div
      v-loading="loading"
      class="view-button-table"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-table :data="tableData" size="mini" border row-key="id" height="400px" :tree-props="{ children: 'children' }">
        <el-table-column prop="name" label="按钮名称" min-width="120" show-overflow-tooltip width="220"></el-table-column>
        <el-table-column prop="sort" label="排序" align="center" width="80"></el-table-column>
        <el-table-column prop="permission" min-width="120" align="center" label="权限标识" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" align="center" width="280">
          <template slot-scope="{ row }">
            <el-button v-if="permissionBtn.add" type="text" icon="el-icon-plus" size="mini" @click="handleAdded(row.id)">新增</el-button>
            <el-button v-if="permissionBtn.edit" type="text" icon="el-icon-edit" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="permissionBtn.del" type="text" icon="el-icon-delete" size="mini" @click="handleDelete(row)">删除</el-button>
            <el-button v-if="permissionBtn.rules" type="text" icon="el-icon-paperclip" size="mini" @click="handleRule(row)"
              >数据规则</el-button
            >
          </template>
        </el-table-column>
        <template slot="empty">
          <base-empty />
        </template>
      </el-table>
    </div>
    <view-rules v-model="rule.visible" :row="ruleRow" />
    <enter-form-view-button
      ref="enterFormRef"
      v-model="enterForm.visible"
      :type="enterForm.type"
      :table-row="mainRow"
      :parent-id="parentId"
      :re-load="getRecords"
    />
  </base-dialog>
</template>

<style lang="scss">
$prefix: view-button;
.#{$prefix}-dialog {
  .#{$prefix}-table {
    .el-table {
      th.el-table__cell {
        background-color: #f8f8f9;
      }
    }
  }
  .el-button {
    &.#{$prefix}-top-btn {
      margin-bottom: 10px;
    }
  }
}
</style>

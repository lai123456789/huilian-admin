<script>
import vPermissionGrid from './v-permission-grid'
import { getMenuTree, getMenuTreeById } from '@/api/admin/menu'
import { setRoleMenu } from '@/api/admin/role'
import { mapTree } from 'xe-utils'

export default {
  name: 'TreeTable',
  components: { vPermissionGrid },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: Object,
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      visible: this.value
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.getData()
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    getData() {
      Promise.all([getMenuTree({ lazy: false }), getMenuTreeById(this.tableRow.roleId)]).then(res => {
        const treeData = res[0].data
        const checkedKeys = res[1].data
        this.$nextTick(() => {
          this.$refs.treeTableRef.initTableData(
            mapTree(treeData, v => ({
              id: v.id,
              parentId: v.parentId,
              name: v.name,
              type: v.type,
              ruleFlag: v.ruleFlag
            })),
            checkedKeys
          )
        })
      })
    },
    getCheckData() {
      return this.$refs.treeTableRef.outputCheck()
    },
    handleCheckAllOrUnCheckAll(flag) {
      this.$refs.treeTableRef.handleCheckAllOrUnCheckAll(flag)
    },
    handleDefaultExpandAll(flag) {
      this.$refs.treeTableRef.handleDefaultExpandAll(flag)
    },
    handleSave(done) {
      const menuIds = this.getCheckData()
      setRoleMenu({ menuIds: menuIds.join(','), roleId: this.tableRow.roleId })
        .then(() => {
          this.visible = false
          this.$message.success('修改成功')
          done()
          this.reLoad()
        })
        .catch(() => {
          done()
        })
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="visible" custom-class="tree-table-dialog" fullscreen title="设置权限" @save="handleSave">
    <div style="height: 100%">
      <v-permission-grid ref="treeTableRef" :role-id="tableRow.roleId" />
    </div>
    <template #footer>
      <div class="dialog-footer-operate">
        <el-button size="mini" type="primary" @click="handleCheckAllOrUnCheckAll(true)">全选</el-button>
        <el-button size="mini" type="primary" @click="handleCheckAllOrUnCheckAll(false)">取消全选</el-button>
        <el-button size="mini" type="primary" @click="handleDefaultExpandAll(true)">全部展开</el-button>
        <el-button size="mini" type="primary" @click="handleDefaultExpandAll(false)">全部收起</el-button>
      </div>
    </template>
  </base-dialog>
</template>

<style lang="scss">
.tree-table-dialog {
  .base-dialog-footer {
    display: flex;
    .dialog-footer-operate {
      text-align: left;
      flex: 1;
    }
  }
}
</style>

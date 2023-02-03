<script>
import { getMenuDataRuleByMenuIdAndRoleId, saveDataRuleMenuDataRule } from '@/api/admin/menu-data-rule'

export default {
  name: 'ViewRules',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      show: false,
      dataRules: [],
      checkedRules: []
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.checkedRules = []
        const { menuId, roleId } = this.row
        getMenuDataRuleByMenuIdAndRoleId(menuId, roleId)
          .then(res => {
            const data = res.data || []
            this.checkedRules = []
            this.dataRules = []
            data.forEach(v => {
              if (v.flag) {
                this.checkedRules.push(v.id)
              }
              this.dataRules.push({ id: v.id, label: v.ruleName })
            })
            this.show = newVal
          })
          .catch(() => {
            this.$emit('update:visible', false)
          })
      }
    },
    show(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    handleSave() {
      const { menuId, roleId } = this.row
      saveDataRuleMenuDataRule({
        dataRuleIds: this.checkedRules.length ? this.checkedRules.join(',') : '',
        menuIds: menuId,
        roleId
      }).then(() => {
        this.show = false
        this.$message.success('操作成功')
      })
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="show" width="600px" title="数据规则" @onSave="handleSave">
    <base-row>
      <el-checkbox-group v-model="checkedRules">
        <base-col v-for="dataRule in dataRules" :key="dataRule.id" class="checkbox-col" :span="24">
          <el-checkbox :label="dataRule.id">{{ dataRule.label }}</el-checkbox>
        </base-col>
      </el-checkbox-group>
    </base-row>
  </base-dialog>
</template>

<style lang="scss" scoped>
.checkbox-col {
  margin-bottom: 5px;
}
</style>

<script>
import { getMenuByPermission } from '@/api/admin/menu'
import jump from '@/utils/jump'

export default {
  name: 'BusinessHelpViewr',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    mark: [String]
  },
  data() {
    return {
      visible: this.value,
      html: '',
      menuId: '0'
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    async value(newValue) {
      this.visible = newValue
      if (newValue) {
        if (!this.mark) return console.error('mark字段传入正确值')
        const res = await getMenuByPermission({ permission: this.mark })
        this.html = res.data.businessNotes
        this.menuId = res.data.menuId || '0'
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleEdit() {
      jump(this, 'HelpCentre', { id: this.menuId })
    }
  }
}
</script>

<template>
  <div class="help-viewr">
    <base-dialog :visible.sync="visible" custom-class="help-viewr-dialog" width="99%" title="帮助文档" :show-save="false">
      <div v-if="html" v-html="html" />
      <base-empty v-else />
      <template v-slot:footer>
        <el-button size="small" icon="el-icon-check" type="primary" @click="handleEdit">编辑</el-button>
      </template>
    </base-dialog>
  </div>
</template>

<style lang="scss">
.help-viewr-dialog {
  display: flex;
  flex-direction: column;
  .el-dialog__body {
    flex: 1;
    height: 0;
    .q-dialog-body {
      padding: 15px;
      height: 100%;
      max-height: none;
    }
  }
}
</style>

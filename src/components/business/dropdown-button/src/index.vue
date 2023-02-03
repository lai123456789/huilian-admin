<script>
export default {
  name: 'BusinessDropdownButton',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: 'mini'
    }
  },
  methods: {
    handleCommand(item) {
      item.handler && item.handler(item)
    }
  }
}
</script>

<template>
  <el-dropdown size="medium" class="business-dropdown" trigger="click" @command="handleCommand">
    <el-button :type="type" :size="size"><slot /><i class="el-icon-arrow-down el-icon--right" /></el-button>
    <el-dropdown-menu slot="dropdown">
      <template v-for="(item, index) in options">
        <el-dropdown-item v-if="item.visible" :key="index" :command="item">{{ item.label }}</el-dropdown-item>
      </template>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<style lang="scss">
.business-dropdown {
  display: inline-block;
  & + .el-button {
    margin-left: 10px;
  }
}
.el-button {
  & + .business-dropdown {
    margin-left: 10px;
  }
}
</style>

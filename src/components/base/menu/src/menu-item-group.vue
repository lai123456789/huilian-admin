<template>
  <li class="el-menu-item-group">
    <div class="el-menu-item-group__title" :style="{paddingLeft: levelPadding + 'px'}">
      <template v-if="!$slots.title">{{ title }}</template>
      <slot v-else name="title"></slot>
    </div>
    <ul>
      <slot></slot>
    </ul>
  </li>
</template>
<script>
export default {
  name: 'BaseMenuItemGroup',

  componentName: 'BaseMenuItemGroup',

  inject: ['rootMenu'],
  props: {
    title: {
      type: String
    }
  },
  data() {
    return {
      // paddingLeft: 20
    }
  },
  computed: {
    levelPadding() {
      let padding = this.rootMenu.indent
      let parent = this.$parent
      if (this.rootMenu.collapse) return this.rootMenu.indent
      while (parent && parent.$options.componentName !== 'BaseMenu') {
        if (parent.$options.componentName === 'BaseSubmenu') {
          padding += this.rootMenu.indent
        }
        parent = parent.$parent
      }
      return padding
    }
  }
}
</script>


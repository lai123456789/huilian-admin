<script>
export default {
  name: 'BaseRow'
}
</script>

<template>
  <el-row v-bind="$attrs">
    <slot></slot>
  </el-row>
</template>

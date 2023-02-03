<script>
export default {
  name: 'BaseCol'
}
</script>

<template>
  <el-col v-bind="$attrs">
    <slot></slot>
  </el-col>
</template>

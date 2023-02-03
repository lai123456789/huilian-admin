<script>
export default {
  name: 'BaseViewer',
  provide() {
    return {
      baseViewer: this
    }
  },
  props: {
    labelWidth: String,
    labelSuffix: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: 'div'
    },
    gutter: Number,
    type: String,
    justify: {
      type: String,
      default: 'start'
    },
    align: String
  }
}
</script>

<template>
  <div class="base-viewer">
    <el-row class="base-viewer-row" :tag="tag" :gutter="gutter" :type="type" :justify="justify" :align="align">
      <slot></slot>
    </el-row>
  </div>
</template>

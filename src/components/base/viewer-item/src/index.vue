<script>
export default {
  name: 'BaseViewerItem',
  inject: ['baseViewer'],
  props: {
    title: String,
    labelWidth: String,
    span: {
      type: Number,
      default: 24
    },
    tag: {
      type: String,
      default: 'div'
    },
    offset: Number,
    pull: Number,
    push: Number,
    xs: [Number, Object],
    sm: [Number, Object],
    md: [Number, Object],
    lg: [Number, Object],
    xl: [Number, Object]
  }
}
</script>

<template>
  <el-col
    class="base-viewer-item"
    :tag="tag"
    :span="span"
    :offset="offset"
    :pull="pull"
    :push="push"
    :xs="xs"
    :sm="sm"
    :md="md"
    :lg="lg"
    :xl="xl"
  >
    <div class="base-viewer-item-label" :style="{ width: labelWidth || baseViewer.labelWidth }">
      <slot name="label">
        {{ title || '' }}
      </slot>
      {{ baseViewer.labelSuffix }}
    </div>
    <div class="base-viewer-item-content">
      <slot></slot>
    </div>
  </el-col>
</template>

<style lang="scss">
.base-viewer-item {
  display: inline-flex;
  float: none;
  padding: 8px 0;
  font-size: 14px;
  &-label {
    padding-right: 15px;
    font-weight: 500;
    text-align: right;
    color: #767c86;
    line-height: 28px;
  }
  &-content {
    font-weight: 400;
    color: #000000;
    line-height: 28px;
    flex: 1;
    word-break: break-all;
  }
}
</style>

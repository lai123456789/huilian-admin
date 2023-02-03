<script>
export default {
  name: 'BusinessDetailsDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: this.visible,
      isOpened: false
    }
  },
  watch: {
    visible(newValue) {
      this.show = newValue
      if (!newValue) {
        this.isOpened = false
      }
    },
    show(newValue) {
      this.$emit('update:visible', newValue)
    }
  },
  methods: {
    handleClose() {
      this.$refs.drawerRef.closeDrawer()
    },
    handleRefresh() {
      if (this.isOpened) {
        this.$emit('refresh')
      }
    },
    handleOpened() {
      this.isOpened = true
      this.$emit('opened')
    }
  }
}
</script>

<template>
  <base-drawer
    ref="drawerRef"
    class="business-details-drawer"
    :custom-class="`business-details-drawer-${_uid}`"
    size="100%"
    :visible.sync="show"
    :show-footer="false"
    @opened="handleOpened"
  >
    <template #header>
      <div class="business-details-drawer-header">
        <slot name="title">
          <span class="business-details-drawer-title">
            <i v-if="title" class="el-icon-document business-details-drawer-icon" />{{ title }}</span
          >
        </slot>
        <div class="business-details-drawer-tools">
          <slot name="tools"></slot>
          <i title="刷新" class="business-details-drawer-refresh el-icon-refresh" @click="handleRefresh"></i>
          <i title="关闭" class="business-details-drawer-close el-icon-close" @click="handleClose"></i>
        </div>
      </div>
    </template>
    <slot v-if="show && !loading"></slot>
    <div
      v-else
      v-loading="loading"
      style="height: 100%"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    />
  </base-drawer>
</template>

<style lang="scss">
$prefix: business-details-drawer;
.#{$prefix} {
  height: 100%;
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  &-title {
    display: flex;
    align-items: center;
    font-size: 15px;
    font-weight: bolder;
  }
  &-icon {
    margin-right: 7px;
    font-size: 20px;
    color: var(--color-primary);
  }
  &-close {
    font-size: 18px;
    font-weight: 700;
    color: #606266;
    cursor: pointer;
    &:hover {
      color: var(--color-primary);
    }
  }
  & .base-drawer-body {
    padding: 0;
    box-sizing: border-box;
  }
  &-refresh {
    margin-right: 10px;
    font-size: 16px;
    cursor: pointer;
    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>

<script>
export default {
  name: 'BaseDrawerContent',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    modal: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    direction: {
      type: String,
      default: 'rtl'
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    closeDrawer() {
      this.$refs.drawerRef.closeDrawer()
    },
    handleClose() {
      this.closeDrawer()
    },
    handleCancel() {
      this.closeDrawer()
    },
    handleSave() {
      this.loading = true
      this.$emit('save', () => {
        this.loading = false
      })
    }
  }
}
</script>

<template>
  <el-drawer
    ref="drawerRef"
    v-bind="$attrs"
    :direction="direction"
    :visible="visible"
    :modal="!appendToBody ? false : modal"
    :modal-class="`base-drawer-modal base-drawer-modal-${_uid}`"
    :show-close="false"
    :with-header="false"
    :append-to-body="appendToBody"
    v-on="$listeners"
  >
    <div v-if="showHeader" ref="headerRef" class="base-drawer-header">
      <slot name="header">
        <span class="base-drawer-title">{{ title }}</span>
        <i v-if="showClose" title="关闭" class="base-drawer-close el-icon-close" @click="handleClose"></i>
      </slot>
    </div>
    <div class="base-drawer-body">
      <slot />
    </div>
    <div v-if="showFooter" ref="footerRef" class="base-drawer-footer">
      <slot name="footer">
        <el-button type="primary" size="mini" :loading="loading" @click="handleSave">保存</el-button>
        <el-button size="mini" @click="handleCancel">取消</el-button>
      </slot>
    </div>
  </el-drawer>
</template>

<style lang="scss">
.base-drawer {
  $--border-color: #e6e6e6;
  &-wrap {
    .el-drawer {
      max-width: 100%;
      .el-drawer__body {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    }
  }
  &-title {
    font-size: 15px;
    font-weight: 700;
    color: #606266;
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
  &-header {
    @include ellipsis;

    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    width: 100%;
    border-bottom: 1px solid $--border-color;
    box-sizing: border-box;
  }
  &-body {
    overflow: auto;
    height: 0;
    flex: 1;
  }
  &-footer {
    padding: 10px;
    border-top: 1px solid $--border-color;
    text-align: right;
    .el-button + .el-button {
      margin-left: 10px;
    }
  }
}
</style>

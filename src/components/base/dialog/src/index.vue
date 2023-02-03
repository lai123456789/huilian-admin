<script>
export default {
  name: 'BaseDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    transfer: {
      type: String,
      default: '.app-main :first-child'
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
    showSave: {
      type: Boolean,
      default: true
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    top: {
      type: String,
      default: '25px'
    },
    className: {
      type: String,
      default: ''
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    bodyStyle: {
      type: Object,
      default: () => ({})
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    /** 用于减掉多余的部分 */
    bodyMaxHeightRemain: {
      type: String,
      default: '104px'
    }
  },
  data() {
    return {
      isNoAnimat: true,
      loadingSave: false,
      remain: 0
    }
  },
  watch: {
    visible(newValue) {
      this.loadingSave = false
      if (newValue) {
        if (!this.appendToBody) {
          // 系统里面的页面打开方式有内部和外部，内部打开是嵌在layout组件中的，外部打开是跟登录页同级的
          const transfer = document.querySelector(this.transfer)
          if (transfer) {
            transfer.appendChild(this.$el)
          } else {
            document.querySelector('#app').appendChild(this.$el)
          }
        }
        this.$nextTick(() => {
          const dialogRef = document.querySelector(`.base-dialog-${this._uid}`)
          Object.assign(dialogRef.style, {
            marginBottom: this.top,
            maxHeight: `calc(100% - ${this.top} * 2)`,
            borderRadius: '4px'
          })
        })
        this.handleResize()
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    const transfer = document.querySelector(this.transfer)
    if (transfer) {
      if (transfer && transfer.contains(this.$el)) {
        // eslint-disable-next-line eqeqeq
        if (this.$el.nodeType != '8') {
          transfer && transfer.removeChild(this.$el)
        }
      }
    } else {
      const appRef = document.querySelector('#app')
      if (appRef && appRef.contains(this.$el)) {
        // eslint-disable-next-line eqeqeq
        if (this.$el.nodeType != '8') {
          appRef && appRef.removeChild(this.$el)
        }
      }
    }
    window.removeEventListener('resize', this.handleResize)
  },
  activated() {
    this.handleResize()
  },
  methods: {
    handleResize() {
      this.$nextTick(() => {
        const { headerRef, footerRef } = this.$refs
        let parentRefHeight = 0
        const transfer = document.querySelector(this.transfer)
        if (transfer) {
          parentRefHeight = transfer.offsetHeight
        } else {
          parentRefHeight = document.querySelector('#app').offsetHeight
        }
        let dialogHeaderHeight = 0
        let dialogFooterHeight = 0
        if (headerRef && this.showHeader) {
          dialogHeaderHeight = Math.floor(headerRef.offsetHeight)
        }
        if (footerRef && this.showFooter) {
          dialogFooterHeight = Math.floor(footerRef.offsetHeight)
        }
        if (this.fullscreen) {
          this.remain = `calc(${parentRefHeight}px - (${dialogHeaderHeight}px + ${dialogFooterHeight}px))`
        } else {
          this.remain = `calc(${parentRefHeight}px - ((${this.top} * 2 ) + ${dialogHeaderHeight}px + ${dialogFooterHeight}px))`
        }
      })
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleCancel() {
      this.$emit('update:visible', false)
    },
    handleSave() {
      this.loadingSave = true
      this.$emit('save', () => {
        this.loadingSave = false
      })
    }
  }
}
</script>

<template>
  <el-dialog
    v-if="visible"
    ref="dialogRef"
    v-bind="$attrs"
    destroy-on-close
    :top="top"
    :fullscreen="fullscreen"
    :modal="false"
    :show-close="false"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    :visible.sync="visible"
    :custom-class="`base-dialog base-dialog-${_uid} ${customClass}`"
    :class="`base-dialog-wrap vxe-table--ignore-clear ${isNoAnimat ? 'is-no-animat' : ''} ${className}`"
    v-on="$listeners"
  >
    <div v-if="showHeader" ref="headerRef" class="base-dialog-header">
      <slot name="header">
        <span class="base-dialog-title">{{ title }}</span>
        <i v-if="showClose" title="关闭" class="base-dialog-close el-icon-close" @click="handleClose"></i>
      </slot>
    </div>
    <div class="base-dialog-body" :style="Object.assign(!fullscreen ? { maxHeight: remain } : { height: remain }, bodyStyle)">
      <div v-if="$attrs.loading" class="base-dialog-skeleton">
        <el-skeleton :loading="$attrs.loading" :rows="8" animated />
      </div>
      <slot />
    </div>
    <div v-if="showFooter" ref="footerRef" class="base-dialog-footer">
      <slot name="footer"></slot>
      <el-button v-if="showSave" type="primary" size="mini" :loading="loadingSave" @click="handleSave">保存</el-button>
      <el-button v-if="showCancel" size="mini" @click="handleCancel">取消</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss">
.base-dialog {
  $--border-color: #ebeef5;
  &.el-dialog {
    margin: 0 auto;
  }
  &-wrap {
    position: absolute !important;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    // 关闭弹窗动画
    &.is-no-animat {
      transition-duration: 0s;
      &.dialog-fade-enter-active,
      &.dialog-fade-leave-active {
        animation: none !important;
      }
    }
  }
  .el-dialog__header {
    margin: 0;
    padding: 0;
    border-bottom: 1px solid $--border-color;
  }
  .el-dialog__body {
    overflow: hidden;
    padding: 0;
  }
  .el-dialog__footer {
    padding: 0;
  }
  &.is-fullscreen {
    display: flex;
    margin: 0 !important;
    height: 100% !important;
    max-height: inherit !important;
    flex-direction: column;
    .el-dialog__body {
      max-height: inherit;
      flex: 1;
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
  &-body {
    overflow: auto;
    padding: 10px;
    box-sizing: border-box;
  }
  &-header {
    @include ellipsis;

    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    width: 100%;
    border-radius: 4px 4px 0 0;
    background-color: #f8f8f8;
    user-select: none;
    box-sizing: border-box;
  }
  &-footer {
    padding: 10px;
    border-top: 1px solid $--border-color;
    text-align: right;
    .el-button + .el-button {
      margin-left: 10px;
    }
  }
  &-skeleton {
    padding: 10px;
  }
}
</style>

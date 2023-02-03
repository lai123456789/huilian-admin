<script>
import BaseDrawerContent from './content'

export default {
  name: 'BaseDrawer',
  components: { BaseDrawerContent },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    transfer: {
      type: String,
      default: '.app-main :first-child'
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
      currentIndex: 0
    }
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        if (!this.appendToBody) {
          this.$nextTick(() => {
            // 系统里面的页面打开方式有内部和外部，内部打开是嵌在layout组件中的，外部打开是跟登录页同级的
            const transfer = document.querySelector(this.transfer)
            if (transfer) {
              transfer.appendChild(this.$el)
            } else {
              document.querySelector('#app').appendChild(this.$el)
            }
            this.currentIndex = this.$el.querySelector(`.base-drawer-${this._uid}`).style.zIndex
          })
        }
      }
    }
  },
  methods: {
    closeDrawer() {
      this.$refs.drawerRef.closeDrawer()
    },
    afterEnter() {
      this.$emit('opened')
    },
    afterLeave() {
      this.$emit('closed')
    }
  }
}
</script>

<template>
  <div :class="['base-drawer', { 'not-append-to-body': !appendToBody }]">
    <template v-if="!appendToBody">
      <transition name="el-fade-in" mode="out-in">
        <div v-if="visible && modal && !appendToBody" class="base-drawer-modal" :style="{ zIndex: currentIndex }"></div>
      </transition>
      <transition :name="direction" mode="out-in" @after-enter="afterEnter" @after-leave="afterLeave">
        <base-drawer-content
          v-if="visible"
          ref="drawerRef"
          :class="`base-drawer-wrap base-drawer-${_uid}`"
          :visible="visible"
          :title="title"
          :append-to-body="appendToBody"
          :modal="modal"
          :show-close="showClose"
          :show-header="showHeader"
          :show-footer="showFooter"
          :direction="direction"
          v-bind="$attrs"
          v-on="$listeners"
        >
          <template slot="header">
            <slot name="header"></slot>
          </template>
          <slot></slot>
          <template slot="footer">
            <slot name="footer"></slot>
          </template>
        </base-drawer-content>
      </transition>
    </template>
    <template v-else>
      <base-drawer-content
        ref="drawerRef"
        :class="`base-drawer-wrap base-drawer-${_uid}`"
        :visible="visible"
        :title="title"
        :append-to-body="appendToBody"
        :modal="modal"
        :show-close="showClose"
        :show-header="showHeader"
        :show-footer="showFooter"
        :direction="direction"
        v-bind="$attrs"
        v-on="$listeners"
      >
        <template slot="header">
          <slot name="header"></slot>
        </template>
        <slot></slot>
        <template slot="footer">
          <slot name="footer"></slot>
        </template>
      </base-drawer-content>
    </template>
  </div>
</template>

<style lang="scss">
.base-drawer {
  $--border-color: #e6e6e6;
  &-modal {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3);
  }
  &.not-append-to-body {
    .base-drawer-wrap {
      position: absolute;
    }
    .el-drawer {
      &.el-drawer-fade-enter-active,
      &.el-drawer-fade-leave-active {
        animation: none !important;
      }
      &.rtl,
      &.ltr,
      &.ttb,
      &.btt {
        animation: none;
      }
    }
  }
}
.rtl-enter-active {
  transition: all 0.25s linear;
  transform: translate3d(0, 0, 0);
}
.rtl-enter {
  transform: translate3d(100%, 0, 0);
}
.rtl-leave-active {
  transition: all 0.25s linear;
  transform: translate3d(100%, 0, 0);
}
.rtl-leave {
  transform: translate3d(0, 0, 0);
}
.ltr-enter-active {
  transition: all 0.25s linear;
  transform: translate3d(0, 0, 0);
}
.ltr-enter {
  transform: translate3d(-100%, 0, 0);
}
.ltr-leave-active {
  transition: all 0.25s linear;
  transform: translate3d(-100%, 0, 0);
}
.ltr-leave {
  transform: translate3d(0, 0, 0);
}
.ttb-enter-active {
  transition: all 0.25s linear;
  transform: translate3d(0, 0, 0);
}
.ttb-enter {
  transform: translate3d(0, -100%, 0);
}
.ttb-leave-active {
  transition: all 0.25s linear;
  transform: translate3d(0, -100%, 0);
}
.ttb-leave {
  transform: translate3d(0, 0, 0);
}
.btt-enter-active {
  transition: all 0.25s linear;
  transform: translate3d(0, 0, 0);
}
.btt-enter {
  transform: translate3d(0, 100%, 0);
}
.btt-leave-active {
  transition: all 0.25s linear;
  transform: translate3d(0, 100%, 0);
}
.btt-leave {
  transform: translate3d(0, 0, 0);
}
</style>

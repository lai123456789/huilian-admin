<script>
import Popper from 'element-ui/lib/utils/vue-popper'

export default {
  name: 'BaseSuggestions',
  mixins: [Popper],
  inject: {
    baseAutocomplete: {
      default: ''
    }
  },
  data() {
    this.isActivated = true
    return {}
  },
  computed: {
    classes() {
      return ['base-suggestion', `base-suggestion-${this._uid}`, 'el-popper', 'vxe-table--ignore-clear']
    }
  },
  mounted() {
    this.referenceElm = this.baseAutocomplete.$refs.inputRef.$el.querySelector('.el-input__inner')
    this.baseAutocomplete.popperElm = this.popperElm = this.$el
  },
  activated() {
    this.isActivated = true
  },
  deactivated() {
    this.isActivated = false
  },
  methods: {
    handleDestroy() {
      this.destroySuggestionsPopupr()
    },
    createSuggestionsPopupr() {
      if (this.baseAutocomplete.visible) {
        this.createPopper()
      }
    },
    destroySuggestionsPopupr() {
      if (!this.isActivated) return
      this.destroyPopper()
      const dom = document.querySelector(`.base-suggestion-${this._uid}`)
      if (dom) {
        if (this.appendToBody) {
          document.body.removeChild(this.popperElm)
        } else {
          this.baseAutocomplete.$el.removeChild(this.popperElm)
        }
      }
    }
  }
}
</script>

<template>
  <transition name="el-zoom-in-top" @after-leave="handleDestroy">
    <div v-show="baseAutocomplete.visible" :class="classes" :style="{ minWidth: `${baseAutocomplete.inputWidth}px` }" role="region">
      <el-scrollbar tag="ul" wrap-class="base-suggestion-wrap" view-class="base-suggestion-list">
        <slot></slot>
      </el-scrollbar>
    </div>
  </transition>
</template>

<style lang="scss">
.base-suggestion {
  margin: 5px 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  &-wrap {
    max-height: 234px;
  }
  &-list {
    margin: 0;
    padding: 6px 0;
    list-style: none;
    box-sizing: border-box;
  }
}
</style>

<script>
import {
  selectMixinOptions,
  treeMixinOptions,
  selectMixin,
  treeMixin,
  isEqualsValue,
  cloneValue,
  toArr,
  propsPick,
  isValidArr,
  getParentKeys
} from './utils'
import ElOption from 'element-ui/lib/option'

const SelectTreeOption = {
  extends: ElOption,
  methods: {
    // 拦截点击事件，事件移至 node 节点上
    selectOptionClick() {
      // $parent === slot-scope
      // $parent.$parent === el-tree-node
      this.$parent.$parent.handleClick()
    }
  }
}

export default {
  name: 'BaseTreeSelect',
  mixins: [selectMixin, treeMixin],
  data() {
    return {
      privateValue: null,
      // eslint-disable-next-line vue/no-reserved-keys
      _defaultExpandedKeys: []
    }
  },
  computed: {
    values() {
      return toArr(this.value)
    },
    propsMixin() {
      return {
        value: this.nodeKey || 'value',
        label: 'label',
        children: 'children',
        disabled: 'disabled',
        isLeaf: 'isLeaf',
        ...this.props
      }
    },
    propsElSelect() {
      return propsPick(this.$props, Object.keys(selectMixinOptions.props))
    },
    propsElTree() {
      return {
        ...propsPick(this.$props, Object.keys(treeMixinOptions.props)),
        props: this.propsMixin
      }
    },
    selectPopperClass() {
      return ['base-select-tree-popper', this.propsElSelect.popperClass || '']
    }
  },
  watch: {
    value: {
      handler(newValue) {
        if (!isEqualsValue(newValue, this.privateValue)) {
          this.privateValue = cloneValue(newValue)
          this._updateDefaultExpandedKeys()
        }
      },
      deep: true,
      immediate: true
    },
    data() {
      this._updateDefaultExpandedKeys()
    },
    defaultExpandedKeys: {
      handler() {
        this._updateDefaultExpandedKeys()
      },
      immediate: true
    },
    privateValue(newValue) {
      if (!isEqualsValue(newValue, this.value)) {
        this.$emit('change', cloneValue(newValue))
      }
      if (this.showCheckbox) {
        this.$nextTick(() => {
          this.getTreeInstance().setCheckedKeys(this.values)
        })
      }
    }
  },
  mounted() {
    // get ElTree/ElSelect all methods
    this.$nextTick(() => {
      // eslint-disable-next-line no-extra-semi
      ;['focus', 'blur'].forEach(item => {
        this[item] = this.getSelectInstance()[item]
      })
      ;[
        'filter',
        'updateKeyChildren',
        'getCheckedNodes',
        'setCheckedNodes',
        'getCheckedKeys',
        'setCheckedKeys',
        'setChecked',
        'getHalfCheckedNodes',
        'getHalfCheckedKeys',
        'getCurrentKey',
        'getCurrentNode',
        'setCurrentKey',
        'setCurrentNode',
        'getNode',
        'remove',
        'append',
        'insertBefore',
        'insertAfter'
      ].forEach(item => {
        this[item] = this.getTreeInstance()[item]
      })
    })
  },
  methods: {
    getValByProp(prop, data) {
      const propVal = this.propsMixin[prop]
      if (propVal instanceof Function) {
        return propVal(data, this.getTreeInstance()?.getNode(this.getValByProp('value', data)))
      } else {
        return data[propVal]
      }
    },
    _updateDefaultExpandedKeys() {
      const parentKeys = isValidArr(this.values) && isValidArr(this.data) ? getParentKeys(this.values, this.data, this.getValByProp) : []
      return (this._defaultExpandedKeys = this.defaultExpandedKeys ? this.defaultExpandedKeys.concat(parentKeys) : parentKeys)
    },
    _renderContent(h, { node, data, store }) {
      return h(
        SelectTreeOption,
        {
          props: {
            value: this.getValByProp('value', data),
            label: this.getValByProp('label', data),
            disabled: this.getValByProp('disabled', data)
          }
        },
        this.renderContent
          ? [this.renderContent(h, { node, data, store })]
          : this.$scopedSlots.default
          ? this.$scopedSlots.default({ node, data, store })
          : void 0
      )
    },
    _filterMethod(val = '') {
      if (this.filterMethod) {
        this.filterMethod(val)
      }
      // fix: `tree` reference is empty when component destroy
      // https://github.com/yujinpan/el-select-tree/issues/35
      this.$nextTick(() => {
        this.getTreeInstance() && this.getTreeInstance().filter(val)
      })
    },
    _filterNodeMethod(value, data, node) {
      // fix: https://github.com/yujinpan/el-select-tree/issues/35
      if (this.filterMethod) return this.filterMethod(value, data, node)
      if (!value) return true
      return this.getValByProp('label', data)?.includes(value)
    },
    _nodeClick(data, node, component) {
      if (this.$listeners.nodeClick) {
        this.$listeners.nodeClick(...arguments)
      }
      if (this.canSelect(node)) {
        if (!this.getValByProp('disabled', data)) {
          const elOptionSlot = component.$children.find(item => item.$options._componentTag === 'node-content')
          const elOption = elOptionSlot.$children[0]
          elOption.dispatch('ElSelect', 'handleOptionClick', [elOption, true])
        }
      } else {
        component.handleExpandIconClick()
      }
    },
    _visibleChange(val) {
      if (this.$listeners['visible-change']) {
        this.$listeners['visible-change'](...arguments)
      }
      if (this.filterable && val) {
        this._filterMethod()
      }
    },
    _check(data, params) {
      if (this.$listeners['check']) {
        this.$listeners['check'](...arguments)
      }
      let { checkedKeys } = params
      const { checkedNodes } = params
      // remove folder node when `checkStrictly` is false
      if (!this.checkStrictly) {
        checkedKeys = checkedNodes
          .filter(item => !isValidArr(this.getValByProp('children', item)))
          .map(item => this.getValByProp('value', item))
      }
      this.privateValue = this.multiple
        ? [...checkedKeys]
        : checkedKeys.includes(this.getValByProp('value', data))
        ? this.getValByProp('value', data)
        : void 0
    },
    canSelect(data) {
      return this.checkStrictly || this.getValByProp('isLeaf', data)
    },
    getSelectInstance() {
      return this.$refs.selectRef
    },
    getTreeInstance() {
      return this.$refs.treeRef
    }
  }
}
</script>

<template>
  <div class="base-tree-select">
    <el-select
      ref="selectRef"
      v-bind="propsElSelect"
      :value="privateValue"
      :popper-class="`base-tree-select-popper ${propsElSelect.popperClass || ''}`"
      :filter-method="_filterMethod"
      v-on="$listeners"
      @change="
        val => {
          privateValue = val
        }
      "
      @visible-change="_visibleChange"
    >
      <template #prefix>
        <slot name="prefix" />
      </template>
      <template #empty>
        <slot name="empty" />
      </template>
      <el-tree
        ref="treeRef"
        v-bind="propsElTree"
        :expand-on-click-node="!checkStrictly"
        :filter-node-method="_filterNodeMethod"
        :node-key="propsMixin.value"
        :default-expanded-keys="_defaultExpandedKeys"
        :render-content="_renderContent"
        v-on="$listeners"
        @node-click="_nodeClick"
        @check="_check"
      />
    </el-select>
  </div>
</template>

<style lang="scss">
.base-tree-select {
  width: 100%;
  .el-select {
    width: 100%;
  }
  &-popper {
    // fix: checkbox 在展示下拉框时跳动问题
    .el-checkbox__input {
      display: flex;
    }
    .el-select-dropdown__item {
      padding: 0 30px 0 0;
      // fix: 节点展开时 popper 底部抖动问题
      // https://github.com/yujinpan/el-select-tree/pull/33
      height: 20px;
      flex: 1;
      background: transparent !important;
      line-height: 20px;
      &.selected::after {
        right: 10px;
      }
    }
  }
}
</style>

import Vue from 'vue'

export const selectMixinOptions = {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    name: String,
    id: String,
    value: {
      required: true
    },
    autocomplete: String,
    autoComplete: String,
    automaticDropdown: Boolean,
    size: String,
    disabled: Boolean,
    clearable: Boolean,
    filterable: Boolean,
    allowCreate: Boolean,
    loading: Boolean,
    popperClass: String,
    remote: Boolean,
    loadingText: String,
    noMatchText: String,
    noDataText: String,
    remoteMethod: Function,
    filterMethod: Function,
    multiple: Boolean,
    multipleLimit: Number,
    placeholder: String,
    defaultFirstOption: Boolean,
    reserveKeyword: Boolean,
    valueKey: String,
    collapseTags: Boolean,
    popperAppendToBody: {
      type: Boolean,
      default: true
    }
  }
}
export const selectMixin = Vue.extend(selectMixinOptions)

export const treeMixinOptions = {
  props: {
    data: Array,
    emptyText: String,
    renderAfterExpand: {
      type: Boolean,
      default: true
    },
    nodeKey: String,
    checkStrictly: Boolean,
    defaultExpandAll: Boolean,
    // expandOnClickNode: Boolean,
    // checkOnClickNode: Boolean,
    checkDescendants: Boolean,
    autoExpandParent: { type: Boolean, default: true },
    defaultCheckedKeys: Array,
    defaultExpandedKeys: Array,
    currentNodeKey: [String, Number],
    renderContent: Function,
    showCheckbox: Boolean,
    // draggable: Boolean,
    // allowDrag: Function,
    // allowDrop: Function,
    props: Object,
    lazy: Boolean,
    highlightCurrent: Boolean,
    load: Function,
    // filterNodeMethod: Function,
    accordion: Boolean,
    indent: Number,
    iconClass: String
  }
}
export const treeMixin = Vue.extend(treeMixinOptions)

export function propsPick(props, keys) {
  const result = {}
  keys.forEach((key) => {
    key in props && (result[key] = props[key])
  })
  return result
}

export function toArr(val) {
  return Array.isArray(val) ? val : val || val === 0 ? [val] : []
}

export function isValidArr(val) {
  return Array.isArray(val) && val.length
}

export function getParentKeys(
  currentKeys,
  data,
  getValByProp
) {
  const result = new Set()
  const getKeys = (tree) => {
    tree.forEach((node) => {
      const children = getValByProp('children', node)
      if (children && children.length) {
        if (
          children.find((item) =>
            currentKeys.includes(getValByProp('value', item))
          )
        ) {
          result.add(getValByProp('value', node))
        }
        getKeys(children)
      }
    })
  }
  getKeys(data)
  return Array.from(result)
}

export function cloneValue(val) {
  return Array.isArray(val) ? [...val] : val
}

export function isEqualsValue(val1, val2) {
  return (
    val1 === val2 ||
    (Array.isArray(val1) &&
      Array.isArray(val2) &&
      val1.toString() === val2.toString())
  )
}


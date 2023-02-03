let lock = true
let el = null
// 自定义事件，鼠标按下、抬起，并允许冒泡
const MousedownEvent = new Event('mousedown', { bubbles: true })
const MouseupEvent = new Event('mouseup', { bubbles: true })
const fakeClickOutSide = () => {
  // 触发事件
  document.body.click()
  document.dispatchEvent(MousedownEvent)
  document.dispatchEvent(MouseupEvent)
  lock = true
}
const mousedownHandle = e => {
  const classList = e.target.classList
  // 如果公司组件的类名不同，对应修改即可
  const targets = [
    // select和input组件相关
    'el-select__caret',
    'el-input__inner',
    // date和time相关
    'el-range__icon',
    'el-range-input',
    'el-range-separator',
    'el-range__close-icon',
    'el-time-panel',
    // 表格相关
    'col--edit',
    // vue-popover
    'el-popover__reference'
  ]
  if (classList) {
    // 该判断条件是用来判断点击的是否为下拉框
    if (targets.some(target => classList.contains(target))) {
      lock = false
      return
    }
  }
  if (lock) return
  fakeClickOutSide()
}
const mousewheelHandle = e => {
  const classList = e.target.classList
  const parentClassList = e.target.parentNode.classList

  const targets = [
    'el-select-dropdown__item',
    'el-time-spinner__item',
    'el-tree-node__content',
    'base-autocomplete-suggestion-item',
    'el-popover--plain',
    'el-time-spinner__list'
  ]

  // 如果当前select本身有滚动条，则直接返回
  if (
    lock ||
    (classList.length !== 0 && targets.some(target => classList.contains(target))) ||
    (parentClassList.length !== 0 && targets.some(target => parentClassList.contains(target)))
  ) {
    return
  }
  fakeClickOutSide()
}
const eventListener = type => {
  el[type + 'EventListener']('mousedown', mousedownHandle)
  window[type + 'EventListener']('mousewheel', mousewheelHandle)
  window[type + 'EventListener']('DOMMouseScroll', mousewheelHandle) // fireFox 3.5+
}
export default {
  mounted() {
    el = this.$root.$el
    el.addFakeClickOutSideEventCount = el.addFakeClickOutSideEventCount || 0
    !el.addFakeClickOutSideEventCount &&
      this.$nextTick(() => {
        eventListener('add')
      })
    el.addFakeClickOutSideEventCount += 1
  },
  destroyed() {
    eventListener('remove')
    el.addFakeClickOutSideEventCount -= 1
  }
}

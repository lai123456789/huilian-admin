<script>
import { clone, trim, isFunction } from 'xe-utils'
import clickoutside from './clickoutside'
import { addResizeListener, removeResizeListener } from 'element-ui/lib/utils/resize-event'
import debounce from 'throttle-debounce/debounce'
import Suggestions from './suggestions'

export default {
  name: 'BaseAutocomplete',
  components: { Suggestions },
  directives: {
    clickoutside
  },
  provide() {
    return {
      baseAutocomplete: this
    }
  },
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    value: String,
    label: String,
    fetchSuggestions: Function,
    disabled: Boolean,
    placeholder: String,
    beforeInput: {
      type: Function,
      default: () => () => {}
    },
    triggerOnFocus: {
      type: Boolean,
      default: true
    },
    keyField: {
      type: String,
      default: 'id'
    },
    debounce: {
      type: Number,
      default: 300
    },
    valueKey: {
      type: String,
      required: true
    },
    /** 传入额外的参数 */
    params: {
      type: Object,
      default: () => ({})
    },
    isExist: {
      type: Boolean,
      default: true
    },
    // 处理自动选中匹配值的方法
    onMatchValue: Function
  },
  data() {
    // 当前选中项的id
    this.selectSuggestionId = void 0
    // 当前选中项数据
    this.selectSuggestionRows = []
    // 记录input的宽度
    this.inputWidth = 0
    return {
      // 记录上一次的选中的值
      lastValue: this.value,
      modelValue: this.value,
      suggestions: [],
      highlightedIndex: -1,
      visible: false,
      loading: false,
      showTooltip: true
    }
  },
  computed: {
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    }
  },
  watch: {
    value(newValue) {
      this.modelValue = newValue
      if (this.isExist) {
        this.lastValue = newValue
      }
    },
    visible(newValue) {
      if (!newValue) {
        this.modelValue = trim(this.isExist ? this.lastValue : this.modelValue)
        this.$emit('input', this.modelValue)
      }
    }
  },
  created() {
    this.debouncedQueryInput = debounce(this.debounce, ev => {
      this.handleInput(ev)
    })
  },
  mounted() {
    addResizeListener(this.$el, this.handleResize)
    window.addEventListener('resize', this.handleWindowResize)
  },
  beforeDestroy() {
    if (this.$el && this.handleResize) {
      removeResizeListener(this.$el, this.handleResize)
    }
    window.removeEventListener('resize', this.handleWindowResize)
  },
  methods: {
    getData(callback) {
      this.loading = true
      const params = Object.assign(clone(this.params, true), { [this.valueKey]: trim(this.modelValue) || void 0 })
      if (this.fetchSuggestions) {
        this.suggestions = []
        this.fetchSuggestions(params, suggestions => {
          // 筛选跟绑定值匹配的数据 onMatchValue
          const matchs = suggestions.filter(suggestion => {
            return isFunction(this.onMatchValue)
              ? this.onMatchValue(suggestion, this.modelValue)
              : suggestion[this.valueKey] === trim(this.modelValue)
          })
          // 之前选中的值如果在这批筛选后的数据中，则使用之前选中的值
          if (!matchs.some(match => match[this.keyField] === this.selectSuggestionId)) {
            this.selectSuggestionId = matchs.length > 0 ? matchs[0][this.keyField] : void 0
            this.selectSuggestionRows = matchs[0] ? [matchs[0]] : []
          }

          if (callback) {
            callback()
          }

          this.suggestions = suggestions
          this.loading = false

          this.$nextTick(() => {
            if (this.$refs.suggestionsRef) {
              this.$refs.suggestionsRef.updatePopper()
              this.$refs.suggestionsRef.resetTransformOrigin()
            }
          })
        })
      }
    },
    handleInput() {
      this.beforeInput()
      this.selectSuggestionId = void 0
      this.selectSuggestionRows = []

      // 输入框focus的时候不显示列表
      if (!this.triggerOnFocus && !this.modelValue) {
        this.visible = false
        // 输入框focus且有值时显示列表
      } else if (!this.triggerOnFocus && this.modelValue) {
        this.openSuggestionOptions()
        this.getData(() => {
          if (this.selectSuggestionRows.length > 0) {
            this.handleSelect(this.selectSuggestionRows)
          }
        })
      } else if (this.triggerOnFocus && this.visible) {
        if (!this.modelValue) {
          if (this.isExist) {
            this.lastValue = ''
          }
          this.$emit('clear')
        }
        this.openSuggestionOptions()
        this.getData(() => {
          if (this.selectSuggestionRows.length > 0) {
            this.handleSelect(this.selectSuggestionRows)
          }
        })
      }
      if (!this.isExist) {
        this.$emit('input', this.modelValue)
      }
    },
    handleFocus(ev) {
      this.$emit('focus', ev)
      if (this.visible) return
      if (!this.triggerOnFocus && !this.modelValue) return
      this.openSuggestionOptions()
      this.getData()
    },
    handleBlur(ev) {
      this.$emit('blur', ev)
    },
    handleKeyTab() {
      this.visible = false
      this.$refs.inputRef.blur()
    },
    handleClear() {
      this.beforeInput()

      this.modelValue = ''
      this.selectSuggestionId = void 0
      this.selectSuggestionRows = []

      if (this.triggerOnFocus) {
        // 判断当前的input是否获得焦点
        const input = this.$refs.inputRef.$el.querySelector('.el-input__inner')
        if (input === document.activeElement) {
          this.handleFocus()
        } else {
          this.$refs.inputRef.focus()
        }
      }

      this.$emit('input', '')
      this.$emit('clear', '')
    },
    handleChange(value) {
      this.$emit('change', value)
    },
    openSuggestionOptions() {
      this.visible = true
      this.$refs.suggestionsRef?.createSuggestionsPopupr()
      this.getInputWidth()
    },
    handleSuggestionClick(suggestion) {
      this.modelValue = suggestion[this.valueKey]

      this.selectSuggestionId = suggestion[this.keyField]
      this.selectSuggestionRows = [suggestion]
      this.handleSelect(this.selectSuggestionRows)

      this.visible = false
      this.$refs.inputRef.blur()
      this.$emit('input', this.modelValue)
    },
    handleSuggestionSelected(selectSuggestionId) {
      return selectSuggestionId === this.selectSuggestionId
    },
    handleSuggestionMouseEnter(index) {
      this.highlightedIndex = index
    },
    highlight(index) {
      if (!this.visible || this.loading) return
      if (index < 0) {
        this.highlightedIndex = -1
        return
      }
      if (index >= this.suggestions.length) {
        index = this.suggestions.length - 1
      }
      const suggestion = this.$refs.suggestionsRef.$el.querySelector('.base-suggestion-wrap')
      const suggestionList = suggestion.querySelectorAll('.base-suggestion-list li')

      const highlightItem = suggestionList[index]
      const scrollTop = suggestion.scrollTop
      const offsetTop = highlightItem.offsetTop

      if (offsetTop + highlightItem.scrollHeight > scrollTop + suggestion.clientHeight) {
        suggestion.scrollTop += highlightItem.scrollHeight
      }
      if (offsetTop < scrollTop) {
        suggestion.scrollTop -= highlightItem.scrollHeight
      }
      this.highlightedIndex = index
      this.$refs.inputRef
        .getInput()
        .setAttribute('aria-activedescendant', `${this.highlightedIndex}_item_${this.suggestions[index][this.keyField]}`)
    },
    handleKeyEnter(ev) {
      if (this.visible && this.highlightedIndex >= 0 && this.highlightedIndex < this.suggestions.length) {
        setTimeout(() => {
          ev.preventDefault()
          this.handleSuggestionClick(this.suggestions[this.highlightedIndex])
        }, 0)
      }
    },
    handleSelect(rows) {
      this.lastValue = rows[0][this.valueKey]
      if (this.isExist) {
        this.$emit('input', this.lastValue)
      }
      this.$emit('select', rows)
    },
    /** 获取当前的input的宽度 */
    getInputWidth() {
      this.inputWidth = this.$refs.inputRef?.$el.querySelector('.el-input__inner').getBoundingClientRect().width
    },
    handleClickOutSide() {
      this.visible = false
      this.$refs.inputRef.blur()
    },
    handleWindowResize() {
      if (this.visible && this.$refs.suggestionsRef) {
        this.$refs.suggestionsRef.resetTransformOrigin()
      }
      this.handleInputExceeds()
    },
    handleResize() {
      if (this.visible) {
        this.getInputWidth()
      }
      this.handleInputExceeds()
    },
    // 判断input内容是否超出
    handleInputExceeds() {
      const input = this.$refs.inputRef.getInput()
      // 禁用状态下才显示 tooltip
      if (this.inputDisabled) {
        this.showTooltip = !(input.offsetWidth < input.scrollWidth - 1)
      }
    }
  }
}
</script>

<template>
  <div class="base-autocomplete">
    <el-tooltip placement="top" :content="String(modelValue)" :disabled="!modelValue || showTooltip">
      <el-input
        ref="inputRef"
        v-model="modelValue"
        v-clickoutside="handleClickOutSide"
        v-bind="$attrs"
        :disabled="inputDisabled"
        :placeholder="inputDisabled ? '' : placeholder"
        @input="debouncedQueryInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @clear="handleClear"
        @change="handleChange"
        @keydown.up.native.prevent="highlight(highlightedIndex - 1)"
        @keydown.down.native.prevent="highlight(highlightedIndex + 1)"
        @keydown.enter.native="handleKeyEnter"
        @keydown.native.tab="handleKeyTab"
      >
        <template v-if="$slots.prepend" slot="prepend">
          <slot name="prepend"></slot>
        </template>
        <template v-if="$slots.append" slot="append">
          <slot name="append"></slot>
        </template>
        <template v-if="$slots.prefix" slot="prefix">
          <slot name="prefix"></slot>
        </template>
        <template v-if="$slots.suffix" slot="suffix">
          <slot name="suffix"></slot>
        </template>
      </el-input>
    </el-tooltip>

    <suggestions ref="suggestionsRef" visible-arrow>
      <li
        v-for="(item, index) in suggestions"
        :key="`${index}_item_${item[keyField]}`"
        :class="[
          'base-autocomplete-suggestion-item',
          `base-autocomplete-suggestion-item-${item[keyField]}`,
          { 'is-hover': highlightedIndex === index, 'is-selected': handleSuggestionSelected(item[keyField]) }
        ]"
        @mousedown="handleSuggestionClick(item)"
        @mouseenter="handleSuggestionMouseEnter(index)"
      >
        <slot :item="item">
          <span>{{ item[valueKey] }}</span>
        </slot>
      </li>
      <li v-if="loading" class="base-autocomplete-suggestion-item is-loading">
        <i class="el-icon-loading"></i>
      </li>
      <li v-if="!loading && suggestions.length === 0" class="base-autocomplete-suggestion-item is-empty">
        <slot name="empty"> 暂无数据 </slot>
      </li>
    </suggestions>
  </div>
</template>

<style lang="scss">
.base-autocomplete-suggestion {
  &-item {
    position: relative;
    overflow: hidden;
    padding: 0 20px;
    height: 34px;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #606266;
    list-style: none;
    line-height: 34px;
    box-sizing: border-box;
    cursor: pointer;
    &.is-hover {
      background-color: #f5f7fa;
    }
    &.is-selected {
      font-weight: 700;
      color: var(--color-primary);
    }
    &.is-loading {
      text-align: center;
    }
    &.is-empty {
      font-size: 14px;
      text-align: center;
      color: #999999;
    }
  }
}
</style>

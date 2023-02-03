j
<script>
import { isEmpty, isBoolean, clone } from 'xe-utils'

export default {
  name: 'BaseSearch',
  props: {
    searchConfig: Object
  },
  inject: ['basePage'],
  data() {
    // 如果是点击单元格链接跳转的, 获取路由对象上携带过来的参数
    const params = this.$route.params
    const routerFilterParams = {}
    const routerFiltersMark = Object.hasOwnProperty.call(params, 'filtersMark')
    if (routerFiltersMark) {
      for (const key in params) {
        // 排除key 为 filtersMark
        if (key !== 'filtersMark') {
          routerFilterParams[key] = params[key]
        }
      }
    }
    return {
      form: {},
      terms: [],
      searchItems: {},
      defaultForm: {},
      btnsSpan: 6,
      foldCount: 3,
      isExpand: false,
      labelWidth: '70px',
      routerFilterParams
    }
  },
  watch: {
    searchConfig: {
      handler(newValue) {
        if (newValue) {
          this.btnsSpan = newValue.btnsSpan || 6
          this.foldCount = newValue.foldCount || 3
          this.labelWidth = newValue.labelWidth || '70px'
          this.defaultForm = newValue.form || {}
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      // TODO 当时为什么写这一段代码
      // this.form = clone(Object.assign(this.form, this.defaultForm), true)

      const columns = this.basePage.columns
      const [form, searchItems] = this.createComponentByConfig(columns)
      this.searchItems = this.handleSearchItemsSort(searchItems)
      this.terms = this.handleFormToTerms(Object.assign(clone(this.defaultForm, true), this.routerFilterParams), this.basePage.columns)
      this.form = Object.assign(clone(form, true), clone(this.defaultForm, true), this.routerFilterParams)
      // 用于重置
      this.resetForm = clone(form, true)
    },
    /**
     * 列配置处理成form对象和对应组件
     * @param {array<any>} columns
     */
    createComponentByConfig(columns) {
      const form = {}
      const searchItems = []
      columns.forEach(column => {
        const { field, title, formatter } = column
        let { searchProps } = column
        if (searchProps) {
          const type = searchProps.type ? searchProps.type : 'input'
          let componentName = 'base-input'
          form[field] = ''
          if (searchProps === true || type === 'input') {
            if (isBoolean(searchProps)) {
              searchProps = {}
            } else {
              const { attrs } = searchProps
              if (!attrs) {
                searchProps.attrs = {}
              }
            }
            searchProps.attrs = Object.assign({ size: 'mini', placeholder: `请输入${title}` }, searchProps.attrs || {})
          } else if (type === 'select') {
            componentName = 'base-select'
            const { attrs } = searchProps
            if (!attrs) {
              searchProps.attrs = {}
            }
            searchProps.attrs.placeholder = `请选择${title}`
            if (attrs && attrs.multiple) {
              form[field] = []
            }
            if (formatter && Object.hasOwnProperty.call(formatter, 'type')) {
              if (formatter.type === 'options') {
                searchProps.attrs.options = this.basePage.optionsCache[field]
              }
            }
          } else if (type === 'date') {
            componentName = 'base-date-picker'
            const { attrs } = searchProps
            if (!attrs) {
              searchProps.attrs = {}
            }
            searchProps.attrs = Object.assign(
              {
                type: 'daterange',
                valueFormat: 'yyyy-MM-dd',
                format: 'yyyy-MM-dd',
                startPlaceholder: '开始日期',
                endPlaceholder: '结束日期'
              },
              searchProps.attrs
            )
            form[field] = []
          } else if (type === 'datetime') {
            componentName = 'base-date-picker'
            const { attrs } = searchProps
            if (!attrs) {
              searchProps.attrs = {}
            }
            searchProps.attrs = Object.assign(
              {
                type: 'datetimerange',
                valueFormat: 'yyyy-MM-dd HH:mm:ss',
                format: 'yyyy-MM-dd HH:mm:ss',
                startPlaceholder: '开始日期',
                endPlaceholder: '结束日期'
              },
              searchProps.attrs
            )
            form[field] = []
          } else if (type === 'time') {
            componentName = 'base-time-picker'
            const { attrs } = searchProps
            if (!attrs) {
              searchProps.attrs = {}
            }
            searchProps.attrs = Object.assign(
              {
                type: 'timePicker',
                startPlaceholder: '开始日期',
                endPlaceholder: '结束日期',
                format: 'HH:mm:ss',
                valueFormat: 'HH:mm:ss'
              },
              searchProps.attrs
            )
            form[field] = []
          }

          searchItems.push({
            ...searchProps,
            field,
            title,
            span: searchProps.span || 6,
            componentName,
            formatter
          })
        }
      })
      return [form, searchItems]
    },
    /**
     * 实现展开收起功能
     * @param {boolean} isExpand - 标识
     */
    handleExpand(isExpand) {
      this.isExpand = isExpand
      this.$nextTick(() => {
        this.basePage.recalculate()
      })
    },
    /**
     * 点击搜索按钮
     */
    handleSearch() {
      const form = this.eliminEmptyAndArray(this.form)
      this.terms = this.handleFormToTerms(form, this.basePage.columns)
      this.$nextTick(() => {
        this.basePage.recalculate(true)
      })
      this.$emit('search', form)
    },
    /**
     * 点击重置按钮
     */
    handleReset() {
      this.form = Object.assign(clone(this.resetForm, true), this.defaultForm)
      this.terms = this.handleFormToTerms(this.eliminEmptyAndArray(this.form), this.basePage.columns)
      this.$nextTick(() => {
        this.basePage.recalculate()
      })
      this.$emit('reset', this.form)
    },
    /**
     * 点击清空重新触发搜索
     * @param {object} searchItem - 表单项
     */
    handleClear(searchItem) {
      const { field } = searchItem
      const form = this.eliminEmptyAndArray(Object.assign(this.form, { [field]: this.resetForm[field] }))
      this.terms = this.handleFormToTerms(form, this.basePage.columns)
      this.$nextTick(() => {
        this.basePage.recalculate()
      })
      this.$emit('clear', form)
    },
    handleAllClear() {
      this.form = clone(this.resetForm, true)
      this.terms = []
      this.$nextTick(() => {
        this.basePage.recalculate()
      })
      this.$emit('reset', {})
    },
    /**
     * 剔除空值和数组转换为逗号分隔
     * @param {object} form - 表单对象
     */
    eliminEmptyAndArray(form) {
      const result = {}
      for (const key in form) {
        if (!(isEmpty(form[key]) || form[key] === '')) {
          // 如果是数组类型的值，则需要转成逗号分隔
          result[key] = form[key]
        }
      }
      return result
    },
    /**
     * 将表单对象转换成检索项所需的数组
     * @param {object} form - 表单对象
     * @param {array<any>} searchItems - 表单项数组
     * @returns {array<any>}
     */
    handleFormToTerms(form, searchItems) {
      const result = []

      if (!isEmpty(form)) {
        for (let i = 0; i < searchItems.length; i++) {
          const item = searchItems[i]
          for (const key in form) {
            if (key === item.field) {
              let value = form[key]
              if (item.formatter && item.formatter.type === 'options') {
                // 多选的情况
                if (item.searchProps && item.searchProps.attrs && item.searchProps.attrs.multiple) {
                  const values = []

                  for (let j = 0; j < form[key].length; j++) {
                    const t = form[key][j]
                    const target = (this.basePage.optionsCache[item.field] || []).find(v => v.value === t)
                    values.push(target && target.label ? target.label : t)
                  }
                  value = values
                } else {
                  const target = (this.basePage.optionsCache[item.field] || []).find(v => v.value === form[key])
                  value = target && target.label ? target.label : form[key]
                }
              }
              result.push({ label: item.title, value, ...item })
            }
          }
        }
      }

      return this.handleTermsSort(result)
    },
    /**
     * 处理表单项排序；先找出有设置sort字段和没有设置sort字段的表单项,
     * 然后把有sort字段的进行排序放前面, 没有sort字段按照之前的顺序往后放
     * @param {array<any>} searchItems - 表单项数组
     * @returns {array<any>} 排序完的数组
     */
    handleSearchItemsSort(searchItems) {
      const haveSortFields = []
      const noSortFields = []

      searchItems.forEach(v => {
        if (v.sort) {
          haveSortFields.push(v)
        } else {
          noSortFields.push(v)
        }
      })
      return [...haveSortFields.sort((a, b) => a.sort - b.sort), ...noSortFields]
    },
    /**
     * 处理检索项排序；跟上面的表单项检索一样,
     * @param {array<any>} colums - 列数据
     * @returns {array<any>} 排序完的数组
     */
    handleTermsSort(colums) {
      const haveSortFields = []
      const noSortFields = []

      colums.forEach(colum => {
        if (colum.searchProps && colum.searchProps.sort) {
          haveSortFields.push(colum)
        } else {
          noSortFields.push(colum)
        }
      })
      return [...haveSortFields.sort((a, b) => a.searchProps.sort - b.searchProps.sort), ...noSortFields]
    }
  }
}
</script>

<template>
  <div v-if="searchItems.length" class="base-search">
    <div class="base-search-form">
      <el-form inline size="mini" label-suffix=":" :model="form" :label-width="labelWidth">
        <el-row :gutter="10">
          <template v-for="(searchItem, index) in searchItems">
            <el-col v-if="isExpand ? true : index + 1 <= foldCount" :key="searchItem.field" :span="searchItem.span">
              <el-form-item :label="searchItem.title" :prop="searchItem.field">
                <component
                  :is="searchItem.componentName"
                  v-model="form[searchItem.field]"
                  clearable
                  v-bind="searchItem.attrs"
                  @clear="() => handleClear(searchItem)"
                />
              </el-form-item>
            </el-col>
          </template>
          <el-col v-if="!isExpand" :span="btnsSpan">
            <el-form-item class="base-search-btns" label="">
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
              <el-button class="button-plain" icon="el-icon-delete" type="primary" plain @click="handleReset">重置</el-button>
              <el-link
                v-if="searchItems.length > foldCount"
                class="base-search-expand"
                type="primary"
                :underline="false"
                @click="handleExpand(true)"
                >展开<i class="el-icon-arrow-down"></i>
              </el-link>
            </el-form-item>
          </el-col>
          <el-col v-else :span="24">
            <div class="base-search-party">
              <el-button size="mini" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
              <el-button size="mini" class="button-plain" icon="el-icon-delete" type="primary" plain @click="handleReset">重置</el-button>
              <el-link class="base-search-expand" type="primary" :underline="false" @click="handleExpand(false)"
                >收起<i class="el-icon-arrow-up"></i>
              </el-link>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <slot name="tools" :isExpand="isExpand" />
    </div>
    <!-- 检索项 -->
    <div v-if="terms.length > 0" class="base-search-term">
      <div class="base-search-term-label">检索项：</div>
      <div class="base-search-term-content">
        <el-tag v-for="term in terms" :key="term.field" hit closable size="small" disable-transitions @close="() => handleClear(term)">{{
          `${term.label}: ${Array.isArray(term.value) ? term.value.join(',') : term.value}`
        }}</el-tag>
      </div>
      <div class="base-search-term-clear" @click="handleAllClear">清除</div>
    </div>
  </div>
</template>

<style lang="scss">
.base-search {
  &-form {
    display: flex;
    padding: 10px 10px 0 10px;
    border-bottom: 1px solid #dadfe6;
    box-sizing: border-box;
  }
  .el-form {
    flex: 1;
  }
  .el-row {
    margin: 0 !important;
    .el-col {
      display: inline-block;
      float: none;
      padding: 0 !important;
      vertical-align: top;
      .el-form-item {
        display: flex;
        align-items: center;
        margin-bottom: 11px;
        &__label {
          padding-right: 4px;
          font-size: 12px !important;
          line-height: 1.16 !important;
        }
        &__content {
          width: 100%;
        }
        .el-button {
          &.button-plain {
            color: var(--color-primary);
            background-color: #ffffff !important;
            &:hover {
              color: var(--color-primary);
            }
          }
        }
      }
    }
  }
  &-expand {
    margin-left: 10px;
    font-size: 12px;
  }
  &-party {
    display: inline-block;
    margin-bottom: 10px;
    width: 100%;
    text-align: center;
  }
  &-term {
    display: flex;
    align-items: center;
    padding: 10px 10px 0 10px;
    font-size: 12px;
    color: #bdbdbd;
    box-sizing: border-box;
    .el-tag {
      margin-right: 5px;
      &:last-child {
        margin-right: 0;
      }
    }
    &-clear {
      margin-left: 10px;
      color: #aeaeae;
      cursor: pointer;
    }
  }
}
</style>

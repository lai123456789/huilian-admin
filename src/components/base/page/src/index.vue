<script>
import BaseTable from './components/table'
import BaseSearch from './components/search'
import BaseButtons from './components/buttons'
import BaseTools from './components/tools'
import BaseTablePager from './components/pager'
import BusinessHelpViewr from '@/components/business/help-viewr'
import { clone, isEmpty, isFunction, isPlainObject } from 'xe-utils'
import jump from '@/utils/jump'

export default {
  name: 'BasePage',
  components: { BaseTable, BaseSearch, BaseButtons, BaseTools, BaseTablePager, BusinessHelpViewr },
  provide() {
    return {
      basePage: this
    }
  },
  props: {
    /** 给表格设置一个唯一的名称，用来区分表格配置 */
    name: {
      type: String,
      required: true
    },
    /** 表格行配置信息 */
    tableRowConfig: {
      type: Object,
      default: () => ({})
    },
    /** 自定义行数据唯一主键的字段名（默认自动生成） */
    keyField: {
      type: String,
      default: 'id'
    },
    /** 列配置 */
    columns: {
      type: Array,
      required: true
    },
    request: {
      type: Function,
      required: true
    },
    showChecked: {
      type: Boolean,
      default: true
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    /** 是否显示表尾 */
    showFooter: {
      type: Boolean,
      default: false
    },
    showPager: {
      type: Boolean,
      default: true
    },
    maxHeight: {
      type: [String, Boolean, Number],
      default: false
    },
    height: {
      type: [String, Boolean, Number],
      default: false
    },
    reserve: {
      type: Boolean,
      default: false
    },
    // 额外的参数, 会在request中获取到这个参数
    extraParams: {
      type: Object,
      default: () => ({})
    },
    searchConfig: Object,
    buttonsConfig: Object,
    toolsConfig: Object,
    helpConfig: Object,
    beforeLoad: Function
  },
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
    this.optionsCache = {}
    this.tableData = []
    this.searchForm = Object.assign(this.searchConfig ? clone(this.searchConfig.form, true) || {} : {}, routerFilterParams)
    return {
      loading: false,
      total: 0,
      pager: {
        current: 1,
        size: 20
      },
      startIndex: 0,
      isCurrentSelect: false,
      initialTable: false,
      help: {
        visible: false
      }
    }
  },
  async mounted() {
    this.loading = true
    if (this.beforeLoad) {
      await this.beforeLoad()
    }
    this.load()
  },
  methods: {
    load(callback) {
      return new Promise(resolve => {
        this.$nextTick(() => {
          this.currentTableRef()
            .clearData()
            .then(() => {
              this.handleOptions(this.columns).then(optionsCache => {
                this.optionsCache = optionsCache
                this.request({
                  pager: this.pager,
                  params: this.searchForm,
                  extraParams: this.extraParams,
                  options: this.optionsCache
                }).then(({ data, total }) => {
                  this.total = Number(total)
                  this.currentTableRef().loadData(data, this.optionsCache, () => {
                    this.tableData = data
                    this.loading = false
                    this.initialTable = true

                    if (callback) {
                      callback()
                    }

                    this.$emit('table-loaded')

                    resolve()
                  })
                })
              })
            })
        })
      })
    },
    recalculate(refull) {
      this.currentTableRef().recalculate(refull)
    },
    // 处理 formatter.type 为 options 的方法
    handleOptions(columns, isCache) {
      return new Promise((resolve, reject) => {
        if (isCache && isEmpty(this.optionsCache)) {
          return this.optionsCache
        }
        const promises = []
        const promisesMAP = {}
        columns.forEach(column => {
          if (
            column.formatter &&
            column.formatter.type &&
            column.formatter.type === 'options' &&
            column.formatter.config &&
            column.formatter.config.options
          ) {
            if (!promisesMAP[column.field]) {
              promises.push({ field: column.field, options: column.formatter.config.options })
              promisesMAP[column.field] = true
            }
          }
        })
        if (promises.length) {
          Promise.all(
            promises.map(v => {
              if (isFunction(v.options)) {
                return v.options()
              } else {
                return v.options
              }
            })
          )
            .then(res => {
              const result = {}
              promises.forEach((promise, index) => {
                result[promise.field] = res[index]
              })
              resolve(result)
            })
            .catch(error => {
              reject(error)
            })
        } else {
          resolve({})
        }
      })
    },
    // 刷新表格数据
    refresh(isCurrentSelect = true, callback) {
      this.loading = true
      this.isCurrentSelect = isCurrentSelect
      this.load(callback)
    },
    // ----------------- 表格相关 --------------------
    /**
     * 获取表格数据
     */
    getRecords() {
      return this.currentTableRef()?.getRecords()
    },
    /**
     * 表格复选框值改变时触发
     * @param {array<any>} selectRows - 选中的数据
     */
    handleTableCheckboxChange(selectRows) {
      if (this.$refs.buttonsRef) {
        this.$refs.buttonsRef.updateSelectRows(selectRows)
      }
      this.$nextTick(() => {
        this.recalculate()
      })
      this.$emit('table-checkbox-change', selectRows)
    },
    setCheckboxRow(rows, checked, callback) {
      if (this.currentTableRef()) {
        this.currentTableRef().setCheckboxRow(rows, checked, callback)
      }
    },
    getCheckboxRecords() {
      if (this.currentTableRef()) {
        return this.currentTableRef().getCheckboxRecords()
      }
    },
    /**
     * 设置默认勾选指定行，每一次加载数据都会被调用
     * @param {*} rows 选中的数据
     */
    setTableCheckRowKeys(rows) {
      if (this.currentTableRef()) {
        this.currentTableRef().setCheckRowKeys(rows)
      }
    },
    /**
     * 清空选中的数据
     * @param {isAll} boolean - 是否全部清除，包括分页缓存选中的数据
     */
    handleTableClearCheckbox(isAll) {
      if (this.currentTableRef()) {
        this.currentTableRef().clearCheckboxRow(isAll)
      }
      this.$nextTick(() => {
        this.recalculate()
      })
    },
    /**
     * 根据order对表格数据进行排序
     * @param {object} row - 行数据
     * @param {'up' | 'down'} order - 排序方式
     */
    handleRowsSort(row, order) {
      this.currentTableRef().handleRowsSort(row, order)
    },
    // ----------------- 表格相关 --------------------
    // ----------------- 分页相关 --------------------
    // pageSize 改变时会触发
    handleSizeChange(val) {
      // 条数发生改变时
      this.pager.size = val
      this.pager.current = 1
      this.refresh(false)
      this.startIndex = (this.pager.current - 1) * this.pager.size
    },
    // currentPage 改变时会触发
    handleCurrentChange(val) {
      this.pager.current = val
      this.refresh(false)
      this.startIndex = (this.pager.current - 1) * this.pager.size
    },
    // ----------------- 分页相关 --------------------
    // ----------------- 筛选相关 --------------------
    /**
     * 点击搜索按钮
     * @param {object} form - 不为空的表单对象
     */
    handleSearch(form) {
      this.searchForm = form
      this.refresh(false)
    },
    /**
     * 点击重置按钮
     * @param {object} form - 不为空的表单对象
     */
    handleReset(form) {
      this.searchForm = form
      this.refresh(false)
    },
    /**
     * 点击控件的清空按钮
     * @param {object} form - 不为空的表单对象
     */
    handleClear(form) {
      this.searchForm = form
      this.refresh(false)
    },
    // ----------------- 筛选相关 --------------------
    handleCellLinkClick(value, row, column) {
      const { field, link } = column
      // link 接收 function 或者 object
      if (typeof link === 'function') {
        // 此时会传一个跳转的命名路由的名称，自动处理的参数
        link(row, column, value)
      } else if (isPlainObject(link)) {
        let toField = link.toField
        if (typeof link.toField === 'boolean') {
          toField = field
        }
        jump(this, link.name, { [toField]: row[field], filtersMark: true })
      }
    },
    handleCellDblclick(tableOpt) {
      const { column } = tableOpt
      if (column.type !== 'checkbox') {
        this.$emit('cell-dblclick', tableOpt)
      }
    },
    /** 帮助文档 */
    handleOpenHelp() {
      if (this.helpConfig && this.helpConfig.handler) {
        const open = () => (this.help.visible = true)
        this.helpConfig.handler(open)
      } else {
        this.help.visible = true
      }
    },
    currentTableRef() {
      return this.$refs.tableRef
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    class="base-page"
  >
    <base-table
      ref="tableRef"
      class="base-page-table"
      :name="name"
      :columns="columns"
      :table-row-config="tableRowConfig"
      :key-field="keyField"
      :show-checked="showChecked"
      :show-footer="showFooter"
      :max-height="maxHeight"
      :height="height"
      :reserve="reserve"
      :start-index="startIndex"
      :is-current-select="isCurrentSelect"
      @checkbox-change="handleTableCheckboxChange"
      @cell-link-click="handleCellLinkClick"
      @cell-dblclick="handleCellDblclick"
    >
      <template #empty>
        <slot name="empty">
          <base-empty></base-empty>
        </slot>
      </template>
      <template #form>
        <slot name="search">
          <div v-if="initialTable" class="base-page-search">
            <base-search ref="searchRef" :search-config="searchConfig" @search="handleSearch" @reset="handleReset" @clear="handleClear">
              <template #tools="{ isExpand }">
                <div v-if="helpConfig && helpConfig.show" title="帮助文档" :class="['base-page-search-help', { 'is-expand': isExpand }]">
                  <i class="el-icon-question" @click="handleOpenHelp" />
                </div>
                <business-help-viewr v-if="helpConfig && helpConfig.show" v-model="help.visible" :mark="helpConfig && helpConfig.mark" />
              </template>
            </base-search>
          </div>
        </slot>
      </template>
      <template #toolbar>
        <div v-if="initialTable && showToolbar" class="base-page-toolbar">
          <slot name="buttons">
            <div class="base-page-toolbar-left">
              <base-buttons ref="buttonsRef"></base-buttons>
            </div>
          </slot>
          <slot name="tools">
            <div class="base-page-toolbar-right">
              <base-tools></base-tools>
            </div>
          </slot>
        </div>
      </template>
      <template #pager>
        <div v-if="initialTable" class="base-page-footer">
          <div class="base-page-footer-left">
            <slot name="footer_left"></slot>
          </div>
          <div v-if="showPager" class="base-page-footer-right">
            <slot name="footer_right">
              <base-table-pager ref="pagerRef" @size-change="handleSizeChange" @current-change="handleCurrentChange"></base-table-pager>
            </slot>
          </div>
        </div>
      </template>
    </base-table>
  </div>
</template>

<style lang="scss">
.base-page {
  height: 100%;
  &-search {
    &-help {
      display: flex;
      align-items: center;
      padding-bottom: 10px;
      padding-left: 5px;
      &.is-expand {
        align-items: flex-end;
      }
      & > i {
        margin-right: 7px;
        font-size: 20px;
        color: var(--color-primary);
        cursor: pointer;
      }
    }
  }
  &-toolbar {
    display: flex;
    padding: 10px 10px 0 10px;
    &-left {
      flex: 1;
    }
  }
  .vxe-table {
    margin: 0 10px;
  }
  &-footer {
    display: flex;
    padding-bottom: 8px;
    box-sizing: border-box;
    &-left {
      flex: 1;
    }
  }
}
</style>

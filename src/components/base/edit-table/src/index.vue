<script>
import { isArray, isEmpty, isFunction } from 'xe-utils'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'
import RenderColumn from './render-column'
import './index.scss'

const widgetType = {
  custom: 'custom',
  input: 'input',
  inputNumber: 'inputNumber',
  select: 'select',
  date: 'date'
}

export default {
  name: 'BaseEditTable',
  components: { RenderColumn },
  props: {
    /** 给表格设置一个唯一的名称，用来区分表格配置 */
    name: {
      type: String,
      required: true
    },
    /** 自定义行数据唯一主键的字段名（默认自动生成） */
    keyField: {
      type: String,
      default: '__XID'
    },
    /** 禁用编辑状态 */
    disabled: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    showRadio: {
      type: Boolean,
      default: false
    },
    showSeq: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: false
    },
    seqName: {
      type: String,
      default: '序号'
    },
    showSort: {
      type: Boolean,
      default: false
    },
    showAdded: {
      type: Boolean,
      default: true
    },
    showDelete: {
      type: Boolean,
      default: true
    },
    /** 表格是否显示加载中 */
    // loading: {
    //   type: Boolean,
    //   required: true
    // },
    /** 表格的最大高度 */
    maxHeight: {
      type: [String, Boolean, Number],
      default: false
    },

    height: {
      type: [String, Boolean, Number],
      default: false
    },

    /** 新增一行的时候, 额外插入一些数据 */
    insertAtRow: {
      type: Object,
      default: () => ({})
    },
    /** 是否高亮行 */
    isCurrent: {
      type: Boolean,
      default: false
    },
    editConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 根据field列数据键值对映射
    this.columnsMap = {}
    // 缓存数据字典
    this.optionsCache = {}
    return {
      editRules: {},
      selectRecords: [],
      tableDataNumber: 0
    }
  },
  computed: {
    footerCellStyle() {
      return {
        backgroundColor: '#f5f7fa'
      }
    }
  },
  methods: {
    /**
     * 加载表格数据
     * @param {array | object} data 表格数据
     * @param {string} mode insert(插入) | cover(覆盖) 模式 是在之前的表格数据的基础上插入数据还是覆盖之前数据
     * @param {object|null|number} place 插入的表格的位置 row 指定位置、null从第一行插入、-1 从最后插入
     * @param {boolean} isInsertAtRow 是否插入额外数据数据
     * @return {promise<{row, rows}>} 插入之后的表格数据
     */
    async loadData(data = {}, mode = 'insert', place = -1, isInsertAtRow = true) {
      // 如果模式为 cover 时，先把之前数据清空掉
      if (mode === 'cover') {
        this.getVxeGridInstance().remove()
        this.clearSelectRows()
      }
      if (isArray(data)) {
        const records = []
        for (let i = 0; i < data.length; i++) {
          let record = data[i]
          // 行数据没有唯一主键字段名时,创建新的记录
          if (!(this.keyField in record)) {
            record = await this.getVxeGridInstance().createRow(record)
          }
          records.push(record)
        }
        await this.getVxeGridInstance().insertAt(records, place)
      } else {
        let records = data
        if (!(this.keyField in data)) {
          records = await this.getVxeGridInstance().createRow(data)
        }
        await this.getVxeGridInstance().insertAt(Object.assign(isInsertAtRow ? this.insertAtRow : {}, records), place)
      }
      return { data: this.getRecords() }
    },
    /**
     * 加载列数据
     * @param {array} columns 列数据
     * @param {boolean} isReset 是否恢复到初始状态
     * @return {promise<array>} 处理好列数据
     */
    loadColumns(columns, isReset) {
      return new Promise(resolse => {
        this.handleColumns(columns, false, isReset).then(resultColumns => {
          resolse(resultColumns)
        })
      })
    },
    /** 处理列数据 */
    async handleColumns(columns, isCache, isReset = true) {
      /* 清空之前的校验规则 */
      this.editRules = {}
      const ultimatColumns = []

      this.optionsCache = await this.handleOptions(columns, isCache)
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i]
        const {
          field,
          title,
          type,
          fixed,
          width,
          minWidth,
          align,
          formatter,
          rules,
          visible = true,
          on,
          slots,
          render,
          customRender
        } = column
        let { attrs } = column

        if (!visible) {
          continue
        }

        this.columnsMap[field] = column

        // 初始化attrs的值
        if (!attrs) {
          attrs = {}
        }

        if (rules) {
          this.editRules[field] = rules
        }

        if (type === widgetType.select) {
          // 如果 attrs.options 没值且设置了 formatter.type === options 则 select.options 的优先取这里的值
          if (!attrs.options && formatter && formatter.type && formatter.type === 'options') {
            attrs.options = this.optionsCache[field]
          }
        }

        // 禁用或者不在指定类型的里面就不能启动编辑功能
        const isSupport = !this.disabled && Object.values(widgetType).includes(type)

        ultimatColumns.push(
          Object.assign(
            {},
            {
              field,
              title,
              width,
              fixed,
              minWidth,
              className: isSupport ? 'vxe-table-col-edit' : 'vxe-table-un-col-edit',
              align: align || 'center',
              showOverflow: 'tooltip',
              editRender: isSupport
                ? {
                    // default: 组件触发后可视 visible: 组件一直可视
                    type: 'default',
                    name: 'input'
                  }
                : {},
              slots: {
                header: () => {
                  return [
                    <span>
                      {isSupport ? (
                        <span class={`${isSupport ? 'base-edit-table-title' : ''}`}>
                          <i class="el-icon-edit" /> {title}
                        </span>
                      ) : (
                        title
                      )}
                    </span>
                  ]
                },
                edit: scope => {
                  const { row, rowIndex, columnIndex } = scope
                  return [
                    type === widgetType.input ? (
                      <base-input
                        vModel={row[field]}
                        size={'mini'}
                        {...{
                          attrs: Object.assign(attrs, {
                            placeholder: attrs.placeholder ? attrs.placeholder : `请输入${column.title}`
                          }),
                          on: (() => {
                            const obj = {}
                            for (const key in on) {
                              if (Object.hasOwnProperty.call(on, key)) {
                                obj[key] = (...args) => on[key](args.join(','), column, scope)
                              }
                            }
                            return obj
                          })()
                        }}
                      >
                        {Object.keys(slots || {}).map(key => {
                          return <template slot={key}>{slots[key]({ value: row[field], column, scope })}</template>
                        })}
                      </base-input>
                    ) : type === widgetType.inputNumber ? (
                      <base-input-number
                        vModel={row[field]}
                        size="mini"
                        {...{
                          attrs: Object.assign(attrs, {
                            placeholder: attrs.placeholder ? attrs.placeholder : `请输入${column.title}`
                          }),
                          on: (() => {
                            const obj = {}
                            for (const key in on) {
                              if (Object.hasOwnProperty.call(on, key)) {
                                obj[key] = (...args) => on[key](args.join(','), column, scope)
                              }
                            }
                            return obj
                          })()
                        }}
                      >
                        {Object.keys(slots || {}).map(key => {
                          return <template slot={key}>{slots[key]({ value: row[field], column, scope })}</template>
                        })}
                      </base-input-number>
                    ) : type === widgetType.select ? (
                      <base-select
                        vModel={row[field]}
                        popperClass={`vxe-table--ignore-clear ${attrs.popperClass ? attrs.popperClass : ''}`}
                        size={'mini'}
                        {...{
                          attrs: Object.assign(attrs, {
                            placeholder: attrs.placeholder ? attrs.placeholder : `请选择${column.title}`
                          }),
                          on: (() => {
                            const obj = {}
                            for (const key in on) {
                              if (Object.hasOwnProperty.call(on, key)) {
                                obj[key] = (...args) => on[key](args.join(','), column, scope)
                              }
                            }
                            return obj
                          })()
                        }}
                        remoteMethod={attrs.remoteMethod ? (query, callback) => attrs.remoteMethod(query, callback, column, scope) : void 0}
                      >
                        {Object.keys(slots || {}).map(key => {
                          return <template slot={key}>{slots[key]({ value: row[field], column, scope })}</template>
                        })}
                      </base-select>
                    ) : type === widgetType.date ? (
                      <base-date-picker
                        vModel={row[field]}
                        popperClass={`vxe-table--ignore-clear ${attrs.popperClass ? attrs.popperClass : ''}`}
                        size={'mini'}
                        {...{
                          attrs: Object.assign(attrs, {
                            placeholder: attrs.placeholder ? attrs.placeholder : `请选择${column.title}`,
                            startPlaceholder: attrs.startPlaceholder ? attrs.startPlaceholder : `开始日期`,
                            endPlaceholder: attrs.endPlaceholder ? attrs.endPlaceholder : `结束日期`
                          }),
                          on: (() => {
                            const obj = {}
                            for (const key in on) {
                              if (Object.hasOwnProperty.call(on, key)) {
                                obj[key] = (...args) => on[key](args.join(','), column, scope)
                              }
                            }
                            return obj
                          })()
                        }}
                      >
                        {Object.keys(slots || {}).map(key => {
                          return <template slot={key}>{slots[key]({ value: row[field], column, scope })}</template>
                        })}
                      </base-date-picker>
                    ) : type === widgetType.custom ? (
                      <render-column
                        row={row}
                        rowIndex={rowIndex}
                        column={column}
                        columnIndex={columnIndex}
                        dictionary={this.dictCache}
                        render={customRender}
                      />
                    ) : type === widgetType.select || (formatter && formatter.type === 'options') ? (
                      <span>{this.transformOptions(this.optionsCache[field] || [], row[field])}</span>
                    ) : type === widgetType.inputNumber || (formatter && formatter.type === 'number') ? (
                      <span>{this.transformNumber(formatter || {}, row[field])}</span>
                    ) : formatter && formatter.type === 'date' ? (
                      <span>{this.transformDate(formatter, row[field])}</span>
                    ) : render ? (
                      <render-column
                        row={row}
                        rowIndex={rowIndex}
                        column={column}
                        columnIndex={columnIndex}
                        dictionary={this.dictCache}
                        render={render}
                      />
                    ) : (
                      <span>{row[field]}</span>
                    )
                  ]
                },
                default: scope => {
                  const { row, rowIndex, columnIndex } = scope
                  return [
                    type === widgetType.select || (formatter && formatter.type === 'options') ? (
                      <span>{this.transformOptions(this.optionsCache[field] || [], row[field])}</span>
                    ) : type === widgetType.inputNumber || (formatter && formatter.type === 'number') ? (
                      <span>{this.transformNumber(formatter || {}, row[field])}</span>
                    ) : formatter && formatter.type === 'date' ? (
                      <span>{this.transformDate(formatter, row[field])}</span>
                    ) : render ? (
                      <render-column
                        row={row}
                        rowIndex={rowIndex}
                        column={column}
                        columnIndex={columnIndex}
                        dictionary={this.dictCache}
                        render={render}
                      />
                    ) : (
                      <span>{row[field]}</span>
                    )
                  ]
                }
              }
            }
          )
        )
      }

      /* 添加多选和序号项 */
      if (this.showSeq) {
        ultimatColumns.unshift({
          type: 'seq',
          title: this.seqName,
          width: 50,
          align: 'center',
          fixed: 'left',
          resizable: false,
          showOverflow: true
        })
      }

      /* 判断是否开启了复选框功能 */
      if (this.showCheckbox) {
        ultimatColumns.unshift({ type: 'checkbox', width: 47, align: 'center', fixed: 'left', resizable: false, showOverflow: true })
        // 判断是否开启了单选框功能
      } else if (this.showRadio) {
        ultimatColumns.unshift({ type: 'radio', width: 47, align: 'center', fixed: 'left', resizable: false, showOverflow: 'title' })
      }

      if (isReset) {
        await this.getVxeGridInstance().reloadColumn(ultimatColumns)
      } else {
        await this.getVxeGridInstance().loadColumn(ultimatColumns)
      }

      return ultimatColumns
    },
    /**
     * 处理options数据字典
     * @param {array} columns 列数据
     * @param {boolean} isCache 是否取缓存里面的数据字典
     * @return {promise<object>} 返回生成好的数据字典对象
     */
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
              // options可传入函数作为参数
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
    /** 获取数据 */
    getRecords() {
      const data = this.getVxeGridInstance().getTableData().fullData
      this.tableDataNumber = data.length
      return this.getVxeGridInstance().getTableData().fullData
    },
    /* 单个复选框选中 */
    handleCheckboxChange(scope) {
      this.selectRecords = this.getCheckboxRecords()
      this.$emit('checkboxChange', this.selectRecords, scope)
    },
    /* 全选复选框选中 */
    handleCheckboxAll(scope) {
      this.selectRecords = this.getCheckboxRecords()
      this.$emit('checkboxAll', this.selectRecords, scope)
    },
    // 设置复选框选中数据
    setCheckboxRow(rows, checked) {
      this.getVxeGridInstance().setCheckboxRow(rows, checked)

      this.selectRecords = this.getCheckboxRecords()
    },
    /* 获取复选框选中的数据 */
    getCheckboxRecords() {
      return this.getVxeGridInstance().getCheckboxRecords()
    },
    /* 单个单选框选中 */
    handleRadioChange(scope) {
      this.selectRecords = [this.getRadioRecords()]
      this.$emit('radioChange', this.selectRecords, scope)
    },
    // 设置单选框选中数据
    setRadioRow(row) {
      this.getVxeGridInstance().setRadioRow(row)
      this.selectRecords = [this.getRadioRecords()]
    },
    /* 获取单选框选中的数据 */
    getRadioRecords() {
      return this.getVxeGridInstance().getRadioRecord()
    },
    /** 清空选中的数据 */
    clearSelectRows() {
      if (this.showCheckbox) {
        this.getVxeGridInstance().clearCheckboxRow()
      } else if (this.showRadio) {
        this.getVxeGridInstance().clearRadioRow()
      }
      this.selectRecords = []
    },
    /** 移除选中的数据 */
    removeSelectRows() {
      if (this.showCheckbox) {
        this.getVxeGridInstance().removeCheckboxRow()
      } else if (this.showRadio) {
        this.getVxeGridInstance().removeRadioRow()
      }
      this.selectRecords = []
    },
    /**
     * 表尾的数据获取方法，返回一个二维数组
     * @param {object} tableOpt
     * @returns {array<array<any>>}
     */
    hadnleFooterMethod({ columns, data }) {
      const sums = []
      columns.forEach((column, columnIndex) => {
        if (columnIndex === 0) {
          sums.push('合计')
        } else if (this.columnsMap[column.field] && this.columnsMap[column.field].sum) {
          const sum = data.reduce((total, row) => {
            return new BigNumber(total).plus(Number(row[column.field]) || 0).toNumber()
          }, 0)

          if (sum !== '') {
            sums.push(
              new BigNumber(sum)
                .dp((this.columnsMap[column.field].footerConfig && this.columnsMap[column.field].footerConfig.precision) || 2)
                .toFormat(
                  Object.assign(
                    {
                      decimalSeparator: '.',
                      groupSeparator: ',',
                      groupSize: 3,
                      secondaryGroupSize: 0,
                      fractionGroupSeparator: ' ',
                      fractionGroupSize: 0
                    },
                    this.columnsMap[column.field].footerConfig
                  )
                )
            )
          }
        } else {
          sums.push('')
        }
      })
      // 返回一个二维数组的表尾合计
      return [sums]
    },
    /* 清除校验 */
    clearValidate() {
      return this.getVxeGridInstance().clearValidate()
    },
    /** 触发校验的方法 */
    validate(callback) {
      this.getVxeGridInstance().fullValidate(errMap => {
        let valids
        if (errMap) {
          const { row, column, rule } = Object.values(errMap)[0][0]
          const index = this.getVxeGridInstance().getVTRowIndex(row)
          valids = { rowIndex: index + 1, row, column, rule }
        }
        if (callback) {
          callback(valids)
        }
      })
    },
    /** 设置高亮行 */
    setCurrentRow(row) {
      return this.getVxeGridInstance().setCurrentRow(row)
    },
    /** 获取高亮的当前行数据 */
    getCurrentRecord() {
      return this.getVxeGridInstance().getCurrentRecord()
    },
    /** 手动清空当前高亮的状态 */
    clearCurrentRow() {
      return this.getVxeGridInstance().clearCurrentRow()
    },
    handleCurrentChange($table) {
      this.$emit('current-change', $table)
    },
    // 单元格被点击时会触发该事件
    handleCellClick($table) {
      this.$emit('cell-click', $table)
    },
    // 单元格被双击时会触发该事件
    handleCellDblclick($table) {
      this.$emit('cell-dblclick', $table)
    },

    /** 获取vxe-table组件实例 */
    getVxeGridInstance() {
      return this.$refs.vxeGridRef
    },
    /** 转换数据字典 */
    transformOptions(options, value) {
      const target = options.find(v => v.value === value)
      return target ? target.label : value
    },
    /** 转换number类型的数据 */
    transformNumber(formatter, value) {
      return value !== void 0
        ? new BigNumber(Number(value)).dp((formatter.config && formatter.config.precision) || 2).toFormat(
            Object.assign(
              {
                decimalSeparator: '.',
                groupSeparator: ',',
                groupSize: 3,
                secondaryGroupSize: 0,
                fractionGroupSeparator: ' ',
                fractionGroupSize: 0
              },
              formatter ? formatter.config || {} : {}
            )
          )
        : ''
    },
    /** 转换日期时间 */
    transformDate(formatter, value) {
      return dayjs(Number(value)).format((formatter.config && formatter.config.valueFormat) || 'yyyy-MM-dd HH:mm:ss')
    },
    // ------------ 按钮功能相关 ----------------
    handleDelete(cb) {
      this.$confirm('是否确认删除所选记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.removeSelectRows()
        if (cb) {
          cb()
        }
        this.$emit('delete')
      })
    },
    /* 上排序方法 */
    async handleUpSort() {
      if (this.getCheckboxRecords().length > 1) return this.$message.warning('暂不支持多条数据排序')
      const checkboxRecord = this.showCheckbox ? this.getCheckboxRecords()[0] : this.getRadioRecords()
      const records = this.getRecords()
      const currentIndex = records.findIndex(record => record[this.keyField] === checkboxRecord[this.keyField])
      if (currentIndex === 0) return this.$message.warning('当前为第一行，无法上移')
      const currentPrevRow = this.getRecords().splice(currentIndex - 1, 1)[0]
      await this.getVxeGridInstance().remove(checkboxRecord)
      await this.loadData(checkboxRecord, 'insert', currentPrevRow, false)
      this.$nextTick(() => {
        if (this.showCheckbox) {
          this.setCheckboxRow(this.getRecords()[currentIndex - 1], true)
        } else {
          this.getVxeGridInstance().setRadioRow(this.getRecords()[currentIndex - 1])
        }
      })
    },
    /* 下排序方法 */
    async handleDownSort() {
      if (this.getCheckboxRecords().length > 1) return this.$message.warning('暂不支持多条数据排序')
      const checkboxRecord = this.showCheckbox ? this.getCheckboxRecords()[0] : this.getRadioRecords()
      const records = this.getRecords()
      const currentIndex = records.findIndex(record => record[this.keyField] === checkboxRecord[this.keyField])
      if (currentIndex === records.length - 1) return this.$message.warning('当前为最后一行，无法下移')
      const currentNextRow = this.getRecords().splice(currentIndex + 1, 1)[0]
      await this.getVxeGridInstance().remove(currentNextRow)
      await this.loadData(currentNextRow, 'insert', checkboxRecord, false)
      this.$nextTick(() => {
        if (this.showCheckbox) {
          this.setCheckboxRow(this.getRecords()[currentIndex + 1], true)
        } else {
          this.getVxeGridInstance().setRadioRow(this.getRecords()[currentIndex + 1])
        }
      })
    }
  },
  render() {
    const maxHeightObj = this.maxHeight ? { maxHeight: this.maxHeight || 0 } : { height: this.height || 'auto' }
    return (
      <div class="base-edit-table">
        <vxe-grid
          ref="vxeGridRef"
          border
          auto-resize
          resizable
          size={'mini'}
          {...{
            attrs: Object.assign(this.$attrs, maxHeightObj)
          }}
          scroll-x={{ gt: 10 }}
          scroll-y={{ gt: 30 }}
          row-config={{ keyField: this.keyField, isHover: true, isCurrent: this.isCurrent }}
          edit-config={Object.assign(this.editConfig, {
            trigger: 'click',
            mode: 'row',
            showIcon: false
          })}
          edit-rules={this.editRules}
          showHeaderOverflow={'tooltip'}
          showFooterOverflow={'tooltip'}
          tooltip-config={{}}
          show-footer={this.showFooter}
          footer-cell-style={this.footerCellStyle}
          footer-method={tableOpt => this.hadnleFooterMethod(tableOpt)}
          onCheckbox-change={this.handleCheckboxChange}
          onCheckbox-all={this.handleCheckboxAll}
          onRadio-change={this.handleRadioChange}
          onCurrent-change={this.handleCurrentChange}
          onCell-click={this.handleCellClick}
          onCell-dblclick={this.handleCellDblclick}
        >
          <template slot="empty">{this.$slots.empty ? this.$slots.empty : <base-empty />}</template>
          <template slot="toolbar">
            {this.showAdded && (
              <el-button size="mini" type="primary" onClick={() => this.loadData()}>
                添加一行
              </el-button>
            )}

            {this.$scopedSlots.buttons && this.$scopedSlots.buttons({ selectRecords: this.selectRecords })}

            {this.showDelete && (
              <el-button size="mini" disabled={!this.selectRecords.length} type="danger" onClick={() => this.handleDelete()}>
                删除
              </el-button>
            )}

            {this.showSort && (
              <el-button
                disabled={!this.selectRecords.length || this.selectRecords.length > 1}
                size="mini"
                type="success"
                onClick={() => this.handleUpSort()}
              >
                上移
              </el-button>
            )}
            {this.showSort && (
              <el-button
                disabled={!this.selectRecords.length || this.selectRecords.length > 1}
                size="mini"
                type="success"
                onClick={() => this.handleDownSort()}
              >
                下移
              </el-button>
            )}
            {this.$scopedSlots.suffixButtons && this.$scopedSlots.suffixButtons({ selectRecords: this.selectRecords })}
          </template>
        </vxe-grid>
      </div>
    )
  }
}
</script>

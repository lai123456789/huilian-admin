/* eslint-disable no-async-promise-executor */
import { clone, isFunction, isNumber, remove } from 'xe-utils'
import BigNumber from 'bignumber.js'
import props from './props'
import { handleFormatter, columnAdaptive, getCellTextWidth } from './methods'
import { handleColumnsIndividua } from './setting'
import FormatterColumn from './formatter-column'
import RenderColumn from './render-column'
import XEClipboard from 'xe-clipboard'
import PopupManager from 'element-ui/lib/utils/popup/popup-manager'
import './index.scss'

/** 取计算列宽自适应时数据数量 */
const CALC_WIDTH_COUNT = 20

export default {
  name: 'BaseTable',
  components: { FormatterColumn, RenderColumn },
  props,
  data() {
    // 表格数据
    this.tableData = []
    // 处理后列配置
    this.tseColumns = []
    // 根据field列数据键值对映射
    this.columnsMap = {}
    // 缓存当前的已经获取到的数据字典
    this.dictCache = {}
    // 缓存表尾合计的数据
    this.footerTotalCache = {}
    // 缓存一下已经每一列计算好的合计数据
    this.footerTotals = []
    // 标识已经计算过合计列了
    this.footerMethodMark = false
    // 设置默认选中数据标识
    this.isCheckRowKeysMark = false
    return {
      selectRows: [],
      menuConfig: {
        body: {
          options: [
            [{ code: 'copy', name: '复制', disabled: false, prefixIcon: 'el-icon-document-copy', className: 'pro-table-copy-item' }]
          ]
        },
        visibleMethod: this.visibleMenuMethod
      }
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
     * @param {array<any>} data
     * @param {object} asyncDicts
     * @param {function} callBack
     */
    async loadData(data, asyncDicts, callBack) {
      this.tseColumns = await this.initColumns(this.columns)
      const columns = await this.handleColumns(data, this.tseColumns, asyncDicts)

      // 保存一份表格数据，供全局使用
      this.tableData = data

      // 使用函数式加载，阻断 vue 对大数组的双向绑定
      if (this.getVxeGridInstance()) {
        Promise.all([this.getVxeGridInstance().reloadColumn(columns), this.getVxeGridInstance().reloadData(data)]).then(async () => {
          // 等表格加载完成之后初始化掉下面的状态和数据
          this.footerMethodMark = false
          this.footerTotals = []
          if (!this.reserve) {
            // 这里无论之前有没有设置默认选中都会清除掉，所以默认选中只会执行一次
            if (!this.isCurrentSelect && !this.isCheckRowKeysMark) {
              this.selectRows = []
            }
            const tableData = this.getRecords()
            const checkRows = tableData.filter(v => !!this.selectRows.find(row => v[this.keyField] === row[this.keyField]))
            await this.setCheckboxRow(checkRows, true, void 0)
            this.isCheckRowKeysMark = false
          } else if (this.reserve && data.length) {
            const tableData = this.getRecords()
            const checkRows = tableData.filter(v => !!this.selectRows.find(row => v[this.keyField] === row[this.keyField]))
            await this.setCheckboxRow(checkRows, true, void 0)
          }

          if (callBack) {
            callBack()
          }
        })
      }
    },
    /** 清空表格数据 */
    clearData() {
      return new Promise((resolve, reject) => {
        if (this.getVxeGridInstance()) {
          this.getVxeGridInstance()
            .reloadData([])
            .then(() => {
              this.tableData = []
              resolve()
            })
            .catch(error => {
              reject(error)
            })
        }
      })
    },
    /**
     * 初始化列配置(校验是否有相同的field字段、深拷贝数据)
     * @param {array<any>} columns
     * @return {promise<void>}
     */
    async initColumns(columns) {
      return new Promise(resolve => {
        // 处理列数据中是否存在相同field字段
        let canNoSameField = true
        let targetField
        for (let i = 0; i < columns.length - 1; i++) {
          for (let j = i + 1; j < columns.length; j++) {
            if (columns[i].field === columns[j].field) {
              targetField = columns[i].field
              canNoSameField = false
              break
            }
          }
          if (!canNoSameField) break
        }

        if (!canNoSameField) throw new Error(`列数据中不能出现相同的field值: ${targetField}`)

        resolve(clone(columns, true))
      })
    },
    /**
     * 处理列数据
     * @param {array<any>} data
     * @param {array<any>} columns
     * @param {object} asyncDicts
     * @return {promise<array>}
     */
    handleColumns(data, columns, asyncDicts) {
      return new Promise(resolve => {
        this.dictCache = asyncDicts
        // 处理完列配置的数据
        const ultimatColumns = []
        // 记录当前列的文本的最大宽度
        let columnTextMaxWidth = 0
        // 获取本地表格调整配置的缓存
        const adjustColumns = handleColumnsIndividua(columns, this.name)

        for (let i = 0; i < adjustColumns.length; i++) {
          const column = adjustColumns[i]
          const {
            field,
            title,
            type,
            align,
            visible,
            width,
            fixed,
            minWidth,
            color,
            link,
            formatter,
            render,
            renderText,
            slots = {}
          } = column

          if (Object.hasOwnProperty.call(column, 'visible') && !visible) continue

          const columnWidth = parseInt(width)
          const columnMinWidth = parseInt(minWidth)

          // 因为render可能会返回dom，因此没法计算宽度，所以要给定一个宽度
          if (!columnWidth && !columnMinWidth && render && !renderText) throw new Error('使用render函数需要指定一个width或者minWidth')

          // 如果有设置的 width 字段 直接使用
          if (!columnWidth) {
            columnTextMaxWidth = this.calcColumnMaxWidth(data, column, this.dictCache)
          }

          this.columnsMap[field] = column

          ultimatColumns.push(
            Object.assign(
              {
                field,
                title,
                type,
                align,
                fixed,
                render,
                showOverflow: 'tooltip',
                slots: Object.assign(slots, {
                  default: ({ row, rowIndex, columnIndex }) => {
                    // 如果是不等于0的假值,则显示跳转图标
                    const linkRef =
                      link && (row[field] === 0 || Boolean(row[field])) ? (
                        <i
                          class="el-icon-link vxe-table-cell-link"
                          onClick={() =>
                            this.handleCellLink(row[field], row, column, column.formatter ? this.dictCache[column.field] : undefined)
                          }
                        />
                      ) : (
                        ''
                      )
                    return [
                      render ? (
                        <render-column
                          row={row}
                          rowIndex={rowIndex}
                          column={column}
                          columnIndex={columnIndex}
                          dictionary={this.dictCache}
                          render={render}
                        />
                      ) : formatter ? (
                        <formatter-column
                          row={row}
                          rowIndex={rowIndex}
                          column={column}
                          columnIndex={columnIndex}
                          dictionary={this.dictCache}
                          formatter={formatter}
                          color={color}
                          onCellLinkClick={this.handleCellLink}
                        />
                      ) : (
                        <span style={{ color: isFunction(color) ? color(row[field], row, column) : color || '#606266' }}>
                          {linkRef}
                          {row[field]}
                        </span>
                      )
                    ]
                  }
                })
              },
              columnWidth ? { width: columnWidth || columnTextMaxWidth } : { minWidth: columnMinWidth || columnTextMaxWidth }
            )
          )
        }

        // 获取最后一条序号，算出序号列最大文本宽度
        const seqWidth = getCellTextWidth(this.startIndex + data.length)
        ultimatColumns.unshift({ type: 'seq', width: seqWidth, align: 'center', fixed: 'left', resizable: false, showOverflow: 'tooltip' })

        // 是否显示复选框列
        if (this.showChecked) {
          ultimatColumns.unshift({ type: 'checkbox', width: 47, align: 'center', fixed: 'left', resizable: false, showOverflow: 'tooltip' })
        }

        resolve(ultimatColumns)
      })
    },
    /**
     * 计算出该列的最大文本宽度
     * @param {array<any>} data
     * @param {object} column
     * @param {object} dictionary
     * @returns {number}
     */
    calcColumnMaxWidth(data, column, dictionary) {
      let maxWidth = column.textMaxColumnWidth ? column.textMaxColumnWidth : 0
      if (!column.textMaxColumnWidth) {
        const arr = []
        const currentColumnAllData = []
        const { field, title, sum, link } = column

        for (let i = 0; i < data.length; i++) {
          const record = data[i]
          currentColumnAllData.push(record[field])
          // 到达最大样本数据，就不参与计算
          if (i + 1 <= CALC_WIDTH_COUNT) {
            if (column.render && column.renderText) {
              arr.push(
                isFunction(column.renderText)
                  ? column.renderText(record[field], record, column, dictionary[column.field])
                  : column.renderText
              )
            } else if (column.formatter) {
              arr.push(
                isFunction(column.formatter)
                  ? column.formatter(record[field], record, column, dictionary[column.field])
                  : handleFormatter(column.formatter, record[field], dictionary[field])
              )
            } else {
              arr.push(record[field])
            }
          }
        }

        // 把表头的文本宽度也算进去
        arr.push(title)

        // 只有设置了合计标识才计算
        if (sum) {
          // 把表尾的文本宽度也算进去
          this.footerTotalCache[column.field] = this.calcFooterTotal(currentColumnAllData, column)
          arr.push(this.footerTotalCache[column.field])
        }

        // 如果该列设置link字段，则要加上图标的宽度
        maxWidth = Math.ceil(columnAdaptive(arr)) + (link ? 20 : 0)
      }
      return maxWidth
    },
    // before -------------- 复选框选中相关的逻辑 ---------------
    /**
     * 只选中当前表格一行
     * @param {object} param
     */
    handleRowClickSelected({ column, row }) {
      // 除了有复选框的列，其他列可以通过行点击选中的当前这一条数据
      if (this.showChecked && column.type !== 'checkbox' && column.type !== 'expand') {
        // 清空选中当前表格数据，并且清空当前选中表格数据的 selectRows
        this.clearCheckboxRow(true)
        this.$nextTick(() => {
          this.setCheckboxRow(row, true, () => {
            if (!this.reserve) {
              this.selectRows.push(row)
            }
          })
        })
      }
    },
    /**
     * 当手动勾选并且值发生改变时触发的事件
     * @param {object} param
     */
    handleCheckboxChange({ row, checked }) {
      if (checked) {
        this.selectRows.push(row)
      } else {
        remove(this.selectRows, v => row[this.keyField] === v[this.keyField])
      }
      this.$emit('checkbox-change', this.getCheckboxRecords())
    },
    /**
     * 当手动勾选全选时触发的事件
     * @param {object} opt
     */
    handleCheckboxAll(opt) {
      const { checked } = opt
      // 这里的判断是因为 handleRowClickSelected 方法里面的执行 clearCheckboxRow 的方法 调用了 handleCheckboxAll
      // 点击全选按钮的时候参数是全的，如果是 setCheckboxRow 的传递参数只有一个 checked
      if (!Object.hasOwnProperty.call(opt, '$table')) return

      if (checked) {
        const rows = []
        this.tableData.forEach(v => {
          if (!this.selectRows.find(row => v[this.keyField] === row[this.keyField])) {
            rows.push(v)
          }
        })
        this.selectRows = [...this.selectRows, ...rows]
      } else {
        this.tableData.forEach(v => {
          remove(this.selectRows, row => v[this.keyField] === row[this.keyField])
        })
      }
      this.$emit('checkbox-change', this.getCheckboxRecords())
    },
    /**
     * 获取已选中的行数据
     */
    getCheckboxRecords() {
      // 开启缓存选中时用最新选中的数据替换之前缓存的选中数据，没有时则直接调用的表格自带的获取数据的api
      // 注意: 开启缓存选中,选中的数据没法保证排序
      return this.reserve || this.isCurrentSelect
        ? this.selectRows.map(
            row =>
              this.getVxeGridInstance()
                .getCheckboxRecords()
                .find(v => v[this.keyField] === row[this.keyField]) || row
          )
        : this.getVxeGridInstance().getCheckboxRecords()
    },
    /**
     * 设置行为选中状态，第二个参数为选中与否
     * @param {array<any>|object} rows
     * @param {boolean} checked
     * @param {function} callback
     */
    setCheckboxRow(rows, checked, callback) {
      this.getVxeGridInstance()
        .setCheckboxRow(rows, checked)
        .then(() => {
          if (callback) {
            callback()
          }
          if (this.reserve) {
            if (Array.isArray(rows)) {
              if (checked) {
                const rows = []
                rows.forEach(v => {
                  if (!this.selectRows.find(row => v[this.keyField] === row[this.keyField])) {
                    rows.push(v)
                  }
                })
                this.selectRows = [...this.selectRows, ...rows]
              } else {
                rows.forEach(v => {
                  remove(this.selectRows, row => v[this.keyField] === row[this.keyField])
                })
              }
            } else {
              if (checked) {
                this.selectRows.push(rows)
              } else {
                remove(this.selectRows, v => rows[this.keyField] === v[this.keyField])
              }
            }
          }
          this.$emit('checkbox-change', this.getCheckboxRecords())
        })
    },
    /**
     * 设置勾选指定行
     * @param {array<any>} rows 选中的数据
     */
    setCheckRowKeys(rows) {
      this.selectRows = rows
      this.isCheckRowKeysMark = true
    },
    /**
     * 清空选中的数据
     */
    clearCheckboxRow(isAll) {
      if (isAll) {
        this.selectRows = []
      }
      this.getVxeGridInstance().clearCheckboxRow()
      this.handleCheckboxAll({ checked: false })
    },
    // end -------------- 复选框选中相关的逻辑 ---------------
    /**
     * 计算当前列的表尾的合计值
     * @param {array<any>} data
     * @param {object} column
     * @returns {string}
     */
    calcFooterTotal(data, column) {
      const total = data.reduce((total, v) => new BigNumber(total).plus(isNumber(Number(v)) ? Number(v) : 0), 0)
      return new BigNumber(total).dp((column.footerConfig && column.footerConfig.precision) || 2).toFormat(
        Object.assign(
          {
            decimalSeparator: '.',
            groupSeparator: ',',
            groupSize: 3,
            secondaryGroupSize: 0,
            fractionGroupSeparator: ' ',
            fractionGroupSize: 0
          },
          column.footerConfig
        )
      )
    },
    /**
     * 表尾的数据获取方法，返回一个二维数组
     * @param {object} tableOpt
     * @returns {array<array<any>>}
     */
    hadnleFooterMethod({ columns }) {
      let total = []
      // 这里会根据数据条数来多次执行这个方法，所以需要控制一下
      if (!this.footerMethodMark) {
        columns.forEach((column, index) => {
          // 第一列默认是合计
          if (index === 0) {
            total.push('合计')
          } else {
            if (Object.hasOwnProperty.call(this.footerTotalCache, column.property)) {
              total.push(this.footerTotalCache[column.property])
            } else {
              total.push(null)
            }
          }
        })
        this.footerTotals = total
      } else {
        total = this.footerTotals
      }
      return [total]
    },
    /**
     * 点击单个单元格上面的跳转图标
     * @param {string|number} value
     * @param {object} row
     * @param {object} column
     * @param {array} dictionary
     */
    handleCellLink(value, row, column, dictionary) {
      this.$emit('cell-link-click', value, row, column, dictionary)
    },
    handleCellDblclick(tableOpt) {
      this.$emit('cell-dblclick', tableOpt)
    },
    /**
     * 返回值用来决定是否允许显示右键菜单（对于需要对菜单进行权限控制时可能会用到）
     * @param {object} tableOpt
     * @returns {boolean}
     */
    visibleMenuMethod(tableOpt) {
      const { options, column, row } = tableOpt
      // 点击到空白区域没有 column 字段
      if (column) {
        options.forEach(list => {
          list.forEach(item => {
            if (['copy'].includes(item.code)) {
              item.disabled =
                column.type === 'checkbox' ||
                column.type === 'seq' ||
                (Object.hasOwnProperty.call(this.columnsMap[column.field], 'render') &&
                  !Object.hasOwnProperty.call(this.columnsMap[column.field], 'renderText')) ||
                // 除了数字0的其他假值
                (row[column.field] !== 0 && !row[column.field])
            }
          })
        })
        return true
      } else {
        return false
      }
    },
    hadnleMenuClickEvent(tableOpt) {
      const { menu, column, row } = tableOpt
      if (menu.code === 'copy') {
        const currentColumn = this.columnsMap[column.field]
        let text = row[column.field]
        if (currentColumn.render && currentColumn.renderText) {
          text = isFunction(currentColumn.renderText)
            ? currentColumn.renderText(row[currentColumn.field], row, currentColumn, this.dictCache[currentColumn.field])
            : currentColumn.renderText
        } else if (currentColumn.formatter) {
          text = isFunction(currentColumn.formatter)
            ? currentColumn.formatter(row[column.field], row, currentColumn, this.dictCache[column.field])
            : handleFormatter(currentColumn.formatter, row[column.field], this.dictCache[column.field])
        }
        if (text && XEClipboard.copy(text)) {
          console.log('复制成功')
        }
      }
    },
    handleClickMenuEvent() {
      this.$nextTick(() => {
        const menuContext = document.querySelector('.vxe-table--context-menu-wrapper')
        // 获取到element-ui的z-index的值
        menuContext.style.zIndex = PopupManager.nextZIndex()
      })
    },
    /**
     * 根据order对表格数据进行排序
     * @param {object} row - 行数据
     * @param {'up' | 'down'} order - 排序方式
     */
    handleRowsSort(row, order) {
      const tableData = this.getRecords()
      // 获取基于当前页的表格数据的索引
      const index = this.getVxeGridInstance().getRowIndex(row)

      if (order === 'up') {
        // 选中的数据为第一条时，无法上移
        if (index === 0) {
          this.$message.error('当前数据已经是第一条，不可上移!')
        } else {
          tableData[index] = tableData.splice(index - 1, 1, tableData[index])[0]
          this.getVxeGridInstance().loadData(tableData)
        }
      } else if (order === 'down') {
        // 选中的数据为最后一条时，无法下移
        if (index === tableData.length - 1) {
          this.$message.error('当前数据已经是最后一条，不可下移!')
        } else {
          tableData[index] = tableData.splice(index + 1, 1, tableData[index])[0]
          this.getVxeGridInstance().loadData(tableData)
        }
      }
    },
    /**
     * 获取表格数据
     */
    getRecords() {
      return this.getVxeGridInstance().getData()
    },
    /**
     * 获取 vxe-grid 组件实例
     * @returns {object}
     */
    getVxeGridInstance() {
      return this.$refs.vxeGridRef
    },
    /**
     * 刷新滚动操作，手动同步滚动相关位置（对于某些特殊的操作，比如滚动条错位、固定列不同步
     */
    refreshScroll() {
      this.getVxeGridInstance().refreshScroll()
    },
    recalculate(refull = true) {
      this.getVxeGridInstance().recalculate(refull)
    }
  },
  render() {
    const maxHeightObj = this.maxHeight ? { maxHeight: this.maxHeight || 0 } : { height: this.height || 'auto' }

    return (
      <div class={['base-table', `base-table-${this._uid}`]}>
        <vxe-grid
          resizable
          auto-resize
          size={'mini'}
          ref="vxeGridRef"
          {...{
            attrs: Object.assign(this.$attrs, maxHeightObj)
          }}
          scroll-x={{ gt: 20 }}
          scroll-y={{ gt: 100 }}
          show-header-overflow={'tooltip'}
          show-footer-overflow={'tooltip'}
          show-footer={this.showFooter}
          footer-cell-style={this.footerCellStyle}
          footer-method={tableOpt => this.hadnleFooterMethod(tableOpt)}
          menu-config={this.menuConfig}
          seq-config={{ startIndex: this.startIndex }}
          resizable-config={{ minWidth: '0' }}
          row-config={Object.assign({ keyField: this.keyField, isHover: true }, this.tableRowConfig)}
          checkbox-config={{ trigger: 'cell', highlight: true }}
          onCheckbox-all={tableOpt => this.handleCheckboxAll(tableOpt)}
          onCheckbox-change={tableOpt => this.handleCheckboxChange(tableOpt)}
          onMenu-click={tableOpt => this.hadnleMenuClickEvent(tableOpt)}
          onCell-menu={tableOpt => this.handleClickMenuEvent(tableOpt)}
          onCell-click={tableOpt => this.handleRowClickSelected(tableOpt)}
          onCell-dblclick={tableOpt => this.handleCellDblclick(tableOpt)}
        >
          <template slot="empty">{this.$slots.empty}</template>
          <template slot="form">{this.$slots.form}</template>
          <template slot="top">{this.$slots.top}</template>
          <template slot="toolbar">{this.$slots.toolbar}</template>
          <template slot="pager">{this.$slots.pager}</template>
        </vxe-grid>
      </div>
    )
  }
}

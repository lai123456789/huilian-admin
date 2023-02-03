import { isFunction } from 'xe-utils'
import { handleFormatter } from './methods'

export default {
  name: 'FormatterColumn',
  props: {
    formatter: {
      type: [Object, Function],
      default: () => ({})
    },
    dictionary: {
      type: Object,
      default: () => ({})
    },
    row: {
      type: Object,
      default: () => ({})
    },
    rowIndex: {
      type: Number,
      default: 0
    },
    column: {
      type: Object,
      default: () => ({})
    },
    columnIndex: {
      type: Number,
      default: 0
    },
    color: {
      type: [String, Function],
      default: '#606266'
    }
  },
  methods: {
    handleCellLink(value, row, column, dictionary) {
      this.$emit('cellLinkClick', value, row, column, dictionary)
    }
  },
  render() {
    const { formatter, row, column } = this
    // 如果是不等于0的假值,则显示跳转图标
    const linkRef = column.link && (row[column.field] === 0 || Boolean(row[column.field])) ? <i class="el-icon-link vxe-table-cell-link" onClick={() => this.handleCellLink(row[column.field], row, column, column.formatter ? this.dictionary[column.formatter.name] : undefined)} /> : ''

    return (
      <span style={{ color: isFunction(this.color) ? this.color(row[column.field], row, column, this.dictionary[column.field]) : this.color }}>
        {linkRef}
        {isFunction(formatter) ? formatter(row[column.field], row, column, this.dictionary[column.field]) : handleFormatter(formatter, row[column.field], this.dictionary[column.field])}
      </span>
    )
  }
}

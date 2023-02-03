
export default {
  name: 'RenderColumn',
  props: {
    render: {
      type: Function,
      default: () => () => { }
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
    }
  },
  render(h) {
    const { render, row, column, rowIndex, columnIndex } = this
    return render(h, row[column.field], row, column, column.formatter ? this.dictionary[column.field] : undefined, rowIndex, columnIndex)
  }
}

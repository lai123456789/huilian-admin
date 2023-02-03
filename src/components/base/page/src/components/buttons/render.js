
export default {
  name: 'Render',
  props: {
    render: {
      type: Function,
      default: () => () => { }
    },
    rows: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => ({})
    }
  },
  render(h) {
    const { render, rows, disabled, item } = this
    return render(h, rows, disabled, item)
  }
}

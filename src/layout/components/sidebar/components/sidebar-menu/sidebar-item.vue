<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    title: {
      type: String,
      default: ''
    },
    isArrow: {
      type: Boolean,
      default: false
    }
  },
  render(_, context) {
    const { title, isArrow } = context.props
    const vnodes = []

    if (isArrow) {
      vnodes.push(<i class="menu-item-hand el-icon-caret-right" />)
    }

    if (title) {
      vnodes.push(<span slot="title">{title}</span>)
    }
    return vnodes
  }
}
</script>

export default {
  /** 给表格设置一个唯一的名称，用来区分表格配置 */
  name: {
    type: String,
    required: true
  },
  /** 列配置 */
  columns: {
    type: Array,
    required: true
  },
  /** 表格行配置信息 */
  tableRowConfig: {
    type: Object,
    default: () => ({})
  },
  /** 表格 loading 标识 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 自定义行数据唯一主键的字段名（默认自动生成） */
  keyField: {
    type: String,
    default: 'id'
  },
  maxHeight: {
    type: [String, Boolean, Number],
    default: false
  },
  height: {
    type: [String, Boolean, Number],
    default: false
  },
  /** 是否显示复选框列 */
  showChecked: {
    type: Boolean,
    default: true
  },
  /** 是否保留勾选状态，比如数据被刷新之后还保留之前选中的状态（需要有 keyField） */
  reserve: {
    type: Boolean,
    default: false
  },
  /** 是否显示表尾 */
  showFooter: {
    type: Boolean,
    default: false
  },
  /** 在通过计算算出的列宽是否平摊到最小宽度 */
  isHalveMinColumnWidth: {
    type: Boolean,
    default: true
  },
  /** 设置序号的起始值 */
  startIndex: {
    type: Number,
    default: 0
  },
  /** 是否刷新时保存当前页选中 */
  isCurrentSelect: {
    type: Boolean,
    default: false
  }
}

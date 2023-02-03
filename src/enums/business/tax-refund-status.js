import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 退税状态 */
export default enums({
  /** 未交单 */
  UNDELIVERED: ['0', '未交单', variables.themeColor],
  /** 已交单 */
  DELIVERED: ['1', '已交单', variables.warningColor],
  /** 已审核完毕 */
  REVIEWED: ['2', '已审核完毕', variables.successColor],
  /** 退税到账 */
  REFUND_ACCOUNT: ['3', '退税到账', variables.dangerColor]
})

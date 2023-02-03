import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 订单财务付款状态 */
export default enums({
  /** 未申请 */
  UNDELIVERED: ['0', '未申请', variables.themeColor],
  /** 已申请 */
  DELIVERED: ['1', '已申请', variables.successColor],
  /** 部分付款 */
  REVIEWED: ['2', '部分付款', variables.warningColor],
  /** 完全付款 */
  REFUND_ACCOUNT: ['3', '完全付款', variables.successColor]
})

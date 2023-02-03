import enums from '../utils'
import variables from '@/styles/variables.scss'
/** 订单财务收款状态 */
export default enums({
  /** 未结算 */
  UNDELIVERED: ['0', '未结算', variables.themeColor],
  /** 已结算 */
  DELIVERED: ['1', '已结算', variables.successColor],
  /** 部分收款 */
  REVIEWED: ['2', '部分收款', variables.warningColor],
  /** 完全收款 */
  REFUND_ACCOUNT: ['3', '完全收款', variables.successColor]
})

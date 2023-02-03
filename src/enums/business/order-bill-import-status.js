import enums from '../utils'
import variables from '@/styles/variables.scss'
/** 订单财务票据进口状态 */
export default enums({
  /** 未开票 */
  UNDELIVERED: ['0', '未开票', variables.themeColor],
  /** 已申请开票 */
  DELIVERED: ['1', '已申请开票', variables.successColor],
  /** 部分开票 */
  REVIEWED: ['2', '部分开票', variables.warningColor],
  /** 完全开票 */
  REFUND_ACCOUNT: ['3', '完全开票', variables.successColor]
})

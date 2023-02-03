import enums from '../utils'
import variables from '@/styles/variables.scss'
/** 订单财务票据出口状态 */
export default enums({
  /** 未收票 */
  UNDELIVERED: ['0', '未收票', variables.themeColor],
  /** 已收票 */
  DELIVERED: ['1', '已收票', variables.successColor]
})

import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 付款状态 */
export default enums({
  /** 未付款 */
  UNPAID: ['0', '未付款', variables.themeColor],
  /** 已付款 */
  PAID: ['1', '已付款', variables.successColor]
})

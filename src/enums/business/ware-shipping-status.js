import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 订单-出库状态 */
export default enums({
  /** 待出库 */
  WAIT: ['0', '待出库', variables.themeColor],
  /** 已出库 */
  SUCCESS: ['1', '已出库', variables.successColor]
})

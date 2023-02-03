import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 出库单-出库状态 */
export default enums({
  /** 待备货 */
  WATE: ['0', '待备货', variables.themeColor],
  /** 已备货 */
  STOCK: ['1', '已备货', variables.infoColor],
  /** 已验货 */
  INSPECT: ['2', '已验货', variables.warningColor],
  /** 已出库 */
  EX: ['3', '已出库', variables.successColor],
  /** 已签收 */
  SIGN: ['4', '已签收', variables.dangerColor]
})

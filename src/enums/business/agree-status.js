import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 生效状态 */
export default enums({
  /** 待生效 */
  WAIT: ['0', '待生效', variables.themeColor],
  /** 已生效 */
  SUCCESS: ['1', '已生效', variables.successColor],
  /** 已到期 */
  ERROR: ['2', '已到期', variables.dangerColor],
  /** 已作废 */
  CANCEL: ['3', '已作废', variables.infoColor]
})

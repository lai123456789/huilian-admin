import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 核销状态 */
export default enums({
  /** 未函调 */
  NOT_CALLED: ['0', '未函调', variables.themeColor],
  /** 函调中 */
  IN_CALL: ['1', '函调中', variables.warningColor],
  /** 函调完成 */
  CALL_COMPLETED: ['2', '函调完成', variables.successColor],
  /** 函调异常 */
  CALL_EXCEPTION: ['3', '函调异常', variables.dangerColor]
})

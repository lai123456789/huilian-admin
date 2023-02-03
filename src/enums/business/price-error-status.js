import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 价格异常状态 */
export default enums({
  /** 无异常 */
  NO: ['0', '无异常', variables.successColor],
  /** 价格异常 */
  ERROR: ['1', '价格异常', variables.dangerColor],
  /** 待审价 */
  WAIT: ['2', '待审价', variables.themeColor]
})

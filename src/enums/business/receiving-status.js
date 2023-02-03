import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 入库状态 */
export default enums({
  /** 待入库 */
  WAIT: ['0', '待入库', variables.themeColor],
  /** 部分入库 */
  PART: ['1', '部分入库', variables.warningColor],
  /** 已入库 */
  SUCCESS: ['2', '已入库', variables.successColor],
  /** 入库异常 */
  ERROR: ['3', '入库异常', variables.dangerColor]
})

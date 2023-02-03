import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 归类状态 */
export default enums({
  /** 未归类 */
  UNCLASSIFIED: ['0', '未归类', variables.dangerColor],
  /** 已归类 */
  CLASSIFIED: ['1', '已归类', variables.successColor]
})

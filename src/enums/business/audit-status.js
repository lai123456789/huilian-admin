import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 审核状态 */
export default enums({
  /** 待审批 */
  WAIT: ['0', '待审批', variables.themeColor],
  /** 审批中 */
  IS: ['1', '审批中', variables.warningColor],
  /** 已审批 */
  PASS: ['2', '已审批', variables.successColor],
  /** 已驳回 */
  REJECT: ['3', '已驳回', variables.dangerColor]
})

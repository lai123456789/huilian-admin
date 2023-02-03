import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 审价状态 */
export default enums({
  /** 待审价 */
  PENDING_PRICE: ['0', '待审价', variables.themeColor],
  /** 价格异常 */
  ABNORMAL_PRICE: ['1', '价格异常', variables.dangerColor],
  /** 审价未通过 */
  PRICE_REVIEW_FAILED: ['2', '审价未通过', variables.dangerColor],
  /** 审价已通过 */
  APPRAISAL_PASSED: ['3', '审价已通过', variables.successColor],
  /** 无异常 */
  NO_ABNORMALITY: ['4', '无异常', variables.successColor]
})

import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 抵扣状态 */
export default enums({
  /** 未抵扣 */
  NOT_DEDUCTED: ['0', '未抵扣', variables.themeColor],
  /** 部分抵扣 */
  PARTIAL_DEDUCTION: ['1', '部分抵扣', variables.warningColor],
  /** 完全抵扣 */
  FULLY_DEDUCTIBLE: ['2', '完全抵扣', variables.successColor]
})

import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 结算状态 */
export default enums({
  /** 未结算 */
  NO: ['0', '未结算', variables.themeColor],
  /** 部分结算 */
  PART: ['1', '部分结算', variables.warningColor],
  /** 已结算 */
  SUCCESS: ['2', '已结算', variables.successColor]
})

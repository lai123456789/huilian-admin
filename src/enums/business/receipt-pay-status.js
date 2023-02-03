import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 收款单付汇状态/结汇状态 */
// TODO 这里的对顺序有要求 付汇状态/结汇状态
export default enums({
  /** 未付汇/未结汇 */
  NO: ['0', '未付汇/未结汇', variables.themeColor],
  /** 部分付汇/部分结汇 */
  PART: ['1', '部分付汇/部分结汇', variables.warningColor],
  /** 已付汇/已结汇 */
  SUCCESS: ['2', '已付汇/已结汇', variables.successColor]
})

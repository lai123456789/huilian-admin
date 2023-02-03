import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 处理状态 */
export default enums({
  /** 未处理 */
  NO: ['0', '未处理', variables.dangerColor],
  /** 已处理 */
  YES: ['1', '已处理', variables.successColor]
})

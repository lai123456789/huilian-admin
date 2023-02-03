import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 认证状态 */
export default enums({
  /** 未认证 */
  NOT_CERTIFIED: ['0', '未认证', variables.themeColor],
  /** 已认证 */
  VERIFIED: ['1', '已认证', variables.successColor]
})

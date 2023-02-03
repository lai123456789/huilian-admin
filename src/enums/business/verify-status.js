import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 核销状态 */
export default enums({
  /** 未核销 */
  UN_VERIFY: ['0', '未核销', variables.themeColor],
  /** 部分核销 */
  PART_VERIFY: ['1', '部分核销', variables.warningColor],
  /** 已核销 */
  ALL_VERIFY: ['2', '已核销', variables.successColor]
})

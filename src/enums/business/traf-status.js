import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 运输状态 */
export default enums({
  /** 待运输 */
  SHIPPED: ['0', '待运输', variables.themeColor],
  /** 运输中 */
  TRANSIT: ['1', '运输中', variables.warningColor],
  /** 已到货 */
  ARRIVED: ['2', '已到货', variables.successColor]
})

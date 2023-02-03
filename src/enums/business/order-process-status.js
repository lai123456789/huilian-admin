import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 订单流程状态 */
export default enums({
  // 流程状态（0:等待，1:正在进行，2:完成，3:异常，4:成功
  WAIT: ['0', '等待', variables.themeColor],
  PROCESS: ['1', '正在进行', variables.successColor],
  FINISH: ['2', '完成', variables.successColor],
  ERROR: ['3', '异常', variables.dangerColor],
  SUCCESS: ['4', '成功', variables.successColor]
})

import enums from '../utils'
import variables from '@/styles/variables.scss'

/** 申报状态 */
export default enums({
  /** 未提交 */
  NO: ['0', '未提交', variables.themeColor],
  /** 已提交 */
  YET: ['1', '已提交', variables.successSeaColor],
  /** 等待暂存 */
  WAIT_HOLD: ['2', '等待暂存', variables.warningColor],
  /** 暂存成功 */
  SUCCESS_HOLD: ['3', '暂存成功', variables.cyanColor],
  /** 暂存失败 */
  ERROR_HOLD: ['4', '暂存失败', variables.dangerColor],
  /** 申报成功 */
  SUCCESS_DECLARE: ['5', '申报成功', variables.successColor]
})

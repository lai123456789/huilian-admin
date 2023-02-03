import enums from '../utils'

/** 计息方式 */
export default enums({
  /** 按日计息 */
  DAY: ['1', '按日计息'],
  /** 按月计息 */
  MONTH: ['30', '按月计息'],
  /** 按年计息 */
  YEAR: ['360', '按年计息']
})

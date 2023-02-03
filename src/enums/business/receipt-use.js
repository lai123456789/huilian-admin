import enums from '../utils'

/** 收款单款项用途 */
export default enums({
  /** 应收核销 */
  VERIFICATION: ['0', '应收核销'],
  /** 进口付汇 */
  PAYMENT: ['1', '进口付汇'],
  /** 出口结汇 */
  SOE: ['2', '出口结汇'],
  /** 其它 */
  OTHER: ['3', '其它']
})

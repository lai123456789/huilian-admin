import enums from '../utils'

/** 付款单款项用途 */
export default enums({
  /** 应付核销 */
  PAY_VERIFI: ['0', '应付核销'],
  /** 进口付汇 */
  PAYMENT: ['1', '进口付汇'],
  /** 出口结汇 */
  SETTLE: ['2', '出口结汇'],
  /** 其他 */
  OTHER: ['3', '其他']
})

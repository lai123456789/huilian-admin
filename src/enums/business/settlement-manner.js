import enums from '../utils'

/** 结算方式 */
export default enums({
  /** 现结 */
  CASH: ['0', '现结'],
  /** 账期 */
  PAYMENT_DAYS: ['1', '账期'],
  /** 月结 */
  MONTH: ['2', '月结'],
  /** 周结 */
  WEEK: ['3', '周结'],
  /** 结账日 */
  ACCOUNT: ['4', '结账日']
})

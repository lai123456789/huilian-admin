import enums from '../utils'

/** 费用大类 */
export default enums({
  /** 货款 */
  CARGO: ['0', '货款'],
  /** 税款 */
  TAX: ['1', '税款'],
  /** 服务费 */
  AGENCY: ['2', '服务费'],
  /** 退税款 */
  BACK_TAX: ['3', '退税款'],
  /** 账期费 */
  PAYMENT_DAY: ['4', '账期费'],
  /** 逾期费 */
  OVERDUE: ['5', '逾期费'],
  /** 杂费 */
  VARIED: ['6', '杂费'],
  /** 资金方借款 */
  FUNDING_LOAN: ['7', '资金方借款']
})

import enums from '../utils'

/** 收款方式/付款方式 */
export default enums({
  /** 银行转账 */
  TRANSFER: ['0', '银行转账'],
  /** T/T */
  T2: ['1', 'T/T'],
  /** 支票 */
  CHEQUE: ['2', '支票'],
  /** 银承 */
  ACCEPTING: ['3', '银承'],
  /** 信用证 */
  LETTER_OF_CREDIT: ['4', '信用证']
})

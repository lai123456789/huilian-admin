import enums from '../utils'

/** 费用类型(费用类别) */
export default enums({
  /** 货款 */
  CARGO: ['0', '货款'],
  /** 服务费 */
  AGENCY: ['1', '服务费'],
  /** 税款 */
  TAX: ['2', '税款'],
  /** 增值税 */
  VAT: ['3', '增值税'],
  /** 消费税 */
  CONSUMPTION_TAX: ['4', '消费税']
})

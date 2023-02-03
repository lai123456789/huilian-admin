import enums from '../utils'

/** 发票开具类型 */
export default enums({
  /** 增值税普通发票 */
  VAT_INVOICE: ['0', '增值税普通发票'],
  /** 增值税专用发票 */
  SPECIAL_VAT_INVOICE: ['1', '增值税专用发票']
})

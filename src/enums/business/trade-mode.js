import enums from '../utils'

/** 贸易模式 */
export default enums({
  /** 代理进口 */
  IMPORT_AGENT: ['0', '代理进口'],
  /** 自营进口 */
  IMPORT_SELF: ['1', '自营进口'],
  /** 代理出口 */
  EXPORT_AGENT: ['2', '代理出口'],
  /** 自营出口 */
  EXPORT_SELF: ['3', '自营出口'],
  /** 代理采购 */
  PURCHASE_AGENT: ['4', '代理采购'],
  /** 代理销售 */
  SALES_AGENT: ['5', '代理销售'],
  /** 货运代理 */
  FREIGHT_AGENT: ['6', '货运代理']
})

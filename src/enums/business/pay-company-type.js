import enums from '../utils'

/** 收款方类型 付款方类型 */
export default enums({
  /** 客户 */
  CUSTOMER: ['0', '客户'],
  /** 供应商 */
  SUPPLIER: ['1', '供应商'],
  /** 承运商 */
  TRANSPORT: ['2', '承运商'],
  /** 报关行 */
  CUSTOMS: ['3', '报关行'],
  /** 资金方 */
  FUNDERS: ['9', '资金方']
})

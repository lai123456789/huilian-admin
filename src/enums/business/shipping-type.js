import enums from '../utils'

/** 出库方式 */
export default enums({
  /** 调度送货 */
  SUPPLIER_DELIVERY: ['0', '调度送货'],
  /** 客户自提 */
  TAKE_DELIVERY: ['1', '客户自提'],
  /** 快递发货 */
  EXPRESS_DELIVERY: ['2', '快递发货'],
  /** 报关运输 */
  CUSTOMS: ['3', '报关运输']
})

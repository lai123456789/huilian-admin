import enums from '../utils'

/** 入库方式 */
export default enums({
  /** 供应商送货 */
  SUPPLIER_DELIVERY: ['0', '供应商送货'],
  /** 调度提货 */
  TAKE_DELIVERY: ['1', '调度提货'],
  /** 快递到货 */
  EXPRESS_DELIVERY: ['2', '快递到货'],
  /** 报关运输 */
  CUSTOMS: ['3', '报关运输'],
  /** 我司自提 */
  TAKE_SELF: ['4', '我司自提'],
  /** 调拨入库 */
  ALLOCATE: ['5', '调拨入库']
})

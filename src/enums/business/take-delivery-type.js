import enums from '../utils'

/** 收货信息收货方式 */
export default enums({
  /** 供应商送货 */
  SUPPLIER_DELIVERY: ['0', '供应商送货'],
  /** 调度提货 */
  TAKE_DELIVERY: ['1', '调度提货'],
  /** 快递到货 */
  EXPRESS_DELIVERY: ['2', '快递到货'],
  /** 我司自提 */
  TAKE_SELF: ['3', '我司自提']
})

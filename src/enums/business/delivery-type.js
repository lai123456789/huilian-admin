import enums from '../utils'

/** 送货信息收货方式 */
export default enums({
  /** 快递发货 */
  EXPRESS_DELIVERY: ['0', '快递发货'],
  /** 调度送货 */
  SUPPLIER_DELIVERY: ['1', '调度送货'],
  /** 客户自提 */
  TAKE_DELIVERY: ['2', '客户自提']
})

import enums from '../utils'

/** 关联单据类型 */
export default enums({
  /** 订单 */
  ORDER: ['0', '订单'],
  /** 付款单 */
  PAYMENTDOC: ['1', '付款单'],
  /** 报关单 */
  CUSTOMSDECLARATION: ['2', '报关单'],
  /** 报关运输单 */
  CUSTOMSDECLARATIONTRANSPORTATION: ['3', '报关运输单']
})

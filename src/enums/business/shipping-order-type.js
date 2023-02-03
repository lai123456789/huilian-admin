import enums from '../utils'

/** 订单类型(出库单) */
export default enums({
  /** 进口订单 */
  IMPORT: ['0', '进口订单'],
  /** 出口订单 */
  EXPORT: ['1', '出口订单'],
  /** 代采订单 */
  AGENT_PURCHASE: ['2', '代采订单'],
  /** 销售订单 */
  SALE: ['4', '销售订单'],
  /** 货代订单 */
  AGENT_FREIGHT: ['6', '货代订单'],
  /** 仓储订单 */
  STORAGE: ['9', '仓储订单']
})

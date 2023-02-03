import enums from '../utils'

/** 订单类型 */
export default enums({
  /** 进口订单 */
  IMPORT: ['0', '进口订单'],
  /** 出口订单 */
  EXPORT: ['1', '出口订单'],
  /** 代采订单 */
  AGENT_PURCHASE: ['2', '代采订单'],
  /** 代销订单 */
  AGENT_SALE: ['3', '代销订单'],
  /** 销售订单 */
  SALE: ['4', '销售订单'],
  /** 采购订单 */
  PURCHASE: ['5', '采购订单'],
  /** 货代订单 */
  AGENT_FREIGHT: ['6', '货代订单'],
  /** 仓储订单 */
  STORAGE: ['9', '仓储订单']
})

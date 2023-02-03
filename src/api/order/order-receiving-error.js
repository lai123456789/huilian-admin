/** 订单入库异常记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderReceivingError`

/** 货代订单入库异常处理 */
export const handleOrderAgentFreightOrderReceivingError = (data) => request.post(`${url}/handleOrderAgentFreight`, data, { transferMode: 'form' })

/** 代采订单入库异常处理 */
export const handleOrderAgentPurchaseOrderReceivingError = (data) => request.post(`${url}/handleOrderAgentPurchase`, data, { transferMode: 'form' })

/** 代销订单入库异常处理 */
export const handleOrderAgentSaleOrderReceivingError = (data) => request.post(`${url}/handleOrderAgentSale`, data, { transferMode: 'form' })

/** 出口订单入库异常处理 */
export const handleOrderExportOrderReceivingError = (data) => request.post(`${url}/handleOrderExport`, data, { transferMode: 'form' })

/** 进口订单入库异常处理 */
export const handleOrderImportOrderReceivingError = (data) => request.post(`${url}/handleOrderImport`, data, { transferMode: 'form' })

/** 采购订单入库异常处理 */
export const handleOrderPurchaseOrderReceivingError = (data) => request.post(`${url}/handleOrderPurchase`, data, { transferMode: 'form' })

/** 仓储订单入库异常处理 */
export const handleOrderStorageOrderReceivingError = (data) => request.post(`${url}/handleOrderStorage`, data, { transferMode: 'form' })

/** 订单入库异常记录分页查询 */
export const getOrderReceivingError = (data) => request.get(`${url}/page`, data)

/** 代采订单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentPurchaseDetail`
export const orderAgentPurchaseDetailImportUrl = `${url}/importDetail`
export const orderAgentPurchaseDetailExportUrl = `${url}/exportDetail`

/** 代采订单明细-查询可入库的订单明细 */
export const getForReceivingOrderAgentPurchaseDetail = (data) => request.post(`${url}/getForReceiving`, data, { transferMode: 'form' })

/** 代采订单明细-查询可出库的订单明细 */
export const getForShippingOrderAgentPurchaseDetail = (data) => request.get(`${url}/getForShipping`, data)

/** 修改代采订单价格 */
export const updatePriceOrderAgentPurchaseDetail = (data) => request.post(`${url}/updatePrice`, data, { transferMode: 'form' })

/** 代采订单明细-分页查询 */
export const getOrderAgentPurchaseDetail = (data) => request.get(`${url}/page`, data)

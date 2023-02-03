/** 代销订单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentSaleDetail`
export const orderAgentSaleDetailImportUrl = `${url}/importDetail`
export const orderAgentSaleDetailExportUrl = `${url}/exportDetail`

/** 代销订单明细-查询可入库的订单明细 */
export const getForReceivingOrderAgentSaleDetail = (data) => request.post(`${url}/getForReceiving`, data, { transferMode: 'form' })

/** 代销订单明细-查询可出库的订单明细 */
export const getForShippingOrderAgentSaleDetail = (data) => request.get(`${url}/getForShipping`, data)

/** 修改代销订单价格 */
export const updatePriceOrderAgentSaleDetail = (data) => request.post(`${url}/updatePrice`, data, { transferMode: 'form' })

/** 代销订单明细-分页查询 */
export const getOrderAgentSaleDetail = (data) => request.get(`${url}/page`, data)

/** 查询可做销售的订单明细 */
export const getForOrderSaleOrderAgentSaleDetail = (data) => request.post(`${url}/getForOrderSale`, data, { transferMode: 'form' })

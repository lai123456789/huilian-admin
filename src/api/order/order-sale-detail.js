/** 销售订单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderSaleDetail`
export const orderSaleDetailImportUrl = `${url}/importDetail`
export const orderSaleDetailExportUrl = `${url}/exportDetail`

/** 销售订单明细-查询可出库的订单明细 */
export const getForShippingOrderSaleDetail = (data) => request.get(`${url}/getForShipping`, data)

/** 修改销售订单价格 */
export const updatePriceOrderSaleDetail = (data) => request.post(`${url}/updatePrice`, data, { transferMode: 'form' })

/** 销售订单明细-分页查询 */
export const getOrderSaleDetail = (data) => request.get(`${url}/page`, data)


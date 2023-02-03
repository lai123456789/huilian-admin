/** 出口订单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderExportDetail`
export const orderExportDetailImportUrl = `${url}/importDetail`
export const orderExportDetailExportUrl = `${url}/exportDetail`

/** 出口订单明细-查询可入库的订单明细 */
export const getForReceivingOrderExportDetail = data => request.post(`${url}/getForReceiving`, data, { transferMode: 'form' })

/** 出口订单明细-查询可出库的订单明细 */
export const getForShippingOrderExportDetail = data => request.get(`${url}/getForShipping`, data)

/** 修改出口订单明细 */
export const updateOrderExportDetail = data => request.post(`${url}/update`, data)

/** 修改出口订单价格 */
export const updatePriceOrderExportDetail = data => request.post(`${url}/updatePrice`, data, { transferMode: 'form' })

/** 出口订单明细-分页查询 */
export const getOrderExportDetail = data => request.get(`${url}/page`, data)

/** 出口订单明细-查询可收票订单明细 */
export const queryForReceiveInvoiceOrderExportDetail = data => request.get(`${url}/queryForReceiveInvoice`, data)

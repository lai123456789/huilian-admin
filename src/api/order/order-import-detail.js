/** 进口订单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderImportDetail`
export const orderImportDetailImportUrl = `${url}/importDetail`
export const orderImportDetailExportUrl = `${url}/exportDetail`

/** 进口订单明细-查询可入库的订单明细 */
export const getForReceivingOrderImportDetail = data => request.post(`${url}/getForReceiving`, data, { transferMode: 'form' })

/** 进口订单明细-查询可出库的订单明细 */
export const getForShippingOrderImportDetail = data => request.get(`${url}/getForShipping`, data)

/** 修改进口订单明细 */
export const updateOrderImportDetail = data => request.post(`${url}/update`, data)

/** 修改进口订单价格 */
export const updatePriceOrderImportDetail = data => request.post(`${url}/updatePrice`, data, { transferMode: 'form' })

/** 进口订单明细-分页查询 */
export const getOrderImportDetail = data => request.get(`${url}/page`, data)

/** 进口订单明细-查询可开票订单明细 */
export const queryForMakeInvoiceOrderImportDetail = data => request.get(`${url}/queryForMakeInvoice`, data)

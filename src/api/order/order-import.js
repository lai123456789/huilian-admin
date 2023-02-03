/** 进口订单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderImport`
const urlRecord = `${apiPrefix}/orderImportOperRecord`

/** 新增进口订单 */
export const saveOrderImport = data => request.post(`${url}/save`, data)

/** 通过id删除进口订单 */
export const deleteOrderImportById = id => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改进口订单 */
export const updateOrderImport = data => request.post(`${url}/update`, data)

/** 进口订单分页查询 */
export const getOrderImport = data => request.get(`${url}/page`, data)

/** 进口订单通过id查询 */
export const getOrderImportById = id => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 进口订单查询审批记录 */
export const getOrderImportAuditList = id => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核进口订单 */
export const auditOrderImport = data => request.post(`${url}/audit`, data)

/** 进口订单-查询未付汇订单 */
export const queryForNotPaymentOrderImport = data => request.get(`${url}/queryForNotPayment`, data)

/** 进口订单-查询可开票订单 */
export const queryForMakeInvoiceOrderImport = data => request.get(`${url}/queryForMakeInvoice`, data)

/** 进口订单-更新指定汇率 */
export const updateRateOrderImport = data => request.post(`${url}/updateRate`, data, { transferMode: 'form' })

/** 进口订单通过id查询对应的订单状态步骤 */
export const getOrderImportStatusById = id => request.get(`${urlRecord}/getProcessStatus`, { id }, { transferMode: 'path' })

/** 修改进口订单订车信息 */
export const updateByBookCarOrderImport = data => request.post(`${url}/updateByBookCar`, data)

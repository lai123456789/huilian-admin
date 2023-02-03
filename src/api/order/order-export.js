/** 出口订单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderExport`
const urlRecord = `${apiPrefix}/orderExportOperRecord`

/** 新增出口订单 */
export const saveOrderExport = data => request.post(`${url}/save`, data)

/** 通过id删除出口订单 */
export const deleteOrderExportById = id => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改出口订单 */
export const updateOrderExport = data => request.post(`${url}/update`, data)

/** 出口订单分页查询 */
export const getOrderExport = data => request.get(`${url}/page`, data)

/** 出口订单通过id查询 */
export const getOrderExportById = id => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 出口订单查询审批记录 */
export const getOrderExportAuditList = id => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核出口订单 */
export const auditOrderExport = data => request.post(`${url}/audit`, data)

/** 出口订单-查询未结汇订单 */
export const queryForNotPaymentOrderExport = data => request.get(`${url}/queryForNotPayment`, data)

/** 出口订单通过id查询对应的订单状态步骤 */
export const getOrderExportStatusById = id => request.get(`${urlRecord}/getProcessStatus`, { id }, { transferMode: 'path' })

/** 修改出口订单订车信息 */
export const updateByBookCarOrderExport = data => request.post(`${url}/updateByBookCar`, data)

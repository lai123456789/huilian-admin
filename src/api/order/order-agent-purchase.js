/** 代采订单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentPurchase`

/** 新增代采订单 */
export const saveOrderAgentPurchase = (data) => request.post(`${url}/save`, data)

/** 通过id删除代采订单 */
export const deleteOrderAgentPurchaseById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改代采订单 */
export const updateOrderAgentPurchase = (data) => request.post(`${url}/update`, data)

/** 代采订单分页查询 */
export const getOrderAgentPurchase = (data) => request.get(`${url}/page`, data)

/** 代采订单通过id查询 */
export const getOrderAgentPurchaseById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 代采订单查询审批记录 */
export const getOrderAgentPurchaseAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核代采订单 */
export const auditOrderAgentPurchase = (data) => request.post(`${url}/audit`, data)

/** 代采订单-查询未付汇订单 */
export const queryForNotPaymentOrderAgentPurchase = (data) => request.get(`${url}/queryForNotPayment`, data)

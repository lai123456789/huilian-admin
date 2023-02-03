/** 采购订单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderPurchase`

/** 新增采购订单 */
export const saveOrderPurchase = (data) => request.post(`${url}/save`, data)

/** 通过id删除采购订单 */
export const deleteOrderPurchaseById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改采购订单 */
export const updateOrderPurchase = (data) => request.post(`${url}/update`, data)

/** 采购订单分页查询 */
export const getOrderPurchase = (data) => request.get(`${url}/page`, data)

/** 采购订单通过id查询 */
export const getOrderPurchaseById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 采购订单查询审批记录 */
export const getOrderPurchaseAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核采购订单 */
export const auditOrderPurchase = (data) => request.post(`${url}/audit`, data)

/** 采购订单-查询未付汇订单 */
export const queryForNotPaymentOrderPurchase = (data) => request.get(`${url}/queryForNotPayment`, data)


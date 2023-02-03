/** 代销订单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentSale`

/** 新增代销订单 */
export const saveOrderAgentSale = (data) => request.post(`${url}/save`, data)

/** 通过id删除代销订单 */
export const deleteOrderAgentSaleById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改代销订单 */
export const updateOrderAgentSale = (data) => request.post(`${url}/update`, data)

/** 代销订单分页查询 */
export const getOrderAgentSale = (data) => request.get(`${url}/page`, data)

/** 代销订单通过id查询 */
export const getOrderAgentSaleById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 代销订单查询审批记录 */
export const getOrderAgentSaleAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核代销订单 */
export const auditOrderAgentSale = (data) => request.post(`${url}/audit`, data)

/** 代销订单-查询未付汇订单 */
export const queryForNotPaymentOrderAgentSale = (data) => request.get(`${url}/queryForNotPayment`, data)


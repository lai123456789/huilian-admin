/** 销售订单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderSale`

/** 新增销售订单 */
export const saveOrderSale = (data) => request.post(`${url}/save`, data)

/** 通过id删除销售订单 */
export const deleteOrderSaleById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改销售订单 */
export const updateOrderSale = (data) => request.post(`${url}/update`, data)

/** 销售订单分页查询 */
export const getOrderSale = (data) => request.get(`${url}/page`, data)

/** 销售订单通过id查询 */
export const getOrderSaleById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 销售订单查询审批记录 */
export const getOrderSaleAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核销售订单 */
export const auditOrderSale = (data) => request.post(`${url}/audit`, data)


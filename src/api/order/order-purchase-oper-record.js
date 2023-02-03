/** 采购订单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderPurchaseOperRecord`

/** 新增采购订单操作日志 */
export const saveOrderPurchaseOperRecord = (data) => request.post(`${url}/save`, data)

/** 采购订单操作日志分页查询 */
export const getOrderPurchaseOperRecord = (data) => request.get(`${url}/page`, data)


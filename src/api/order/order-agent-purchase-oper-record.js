/** 代采订单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentPurchaseOperRecord`

/** 新增代采订单操作日志 */
export const saveOrderAgentPurchaseOperRecord = (data) => request.post(`${url}/save`, data)

/** 代采订单操作日志分页查询 */
export const getOrderAgentPurchaseOperRecord = (data) => request.get(`${url}/page`, data)


/** 代销订单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentSaleOperRecord`

/** 新增代销订单操作日志 */
export const saveOrderAgentSaleOperRecord = (data) => request.post(`${url}/save`, data)

/** 代销订单操作日志分页查询 */
export const getOrderAgentSaleOperRecord = (data) => request.get(`${url}/page`, data)


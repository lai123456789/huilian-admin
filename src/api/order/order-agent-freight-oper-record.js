/** 货代订单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentFreightOperRecord`

/** 新增货代订单操作日志 */
export const saveOrderAgentFreightOperRecord = (data) => request.post(`${url}/save`, data)

/** 货代订单操作日志分页查询 */
export const getOrderAgentFreightOperRecord = (data) => request.get(`${url}/page`, data)


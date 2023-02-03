/** 仓储订单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderStorageOperRecord`

/** 新增仓储订单操作日志 */
export const saveOrderStorageOperRecord = (data) => request.post(`${url}/save`, data)

/** 仓储订单操作日志分页查询 */
export const getOrderStorageOperRecord = (data) => request.get(`${url}/page`, data)


/** 出口订单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderExportOperRecord`

/** 新增出口订单操作日志 */
export const saveOrderExportOperRecord = (data) => request.post(`${url}/save`, data)

/** 出口订单操作日志分页查询 */
export const getOrderExportOperRecord = (data) => request.get(`${url}/page`, data)


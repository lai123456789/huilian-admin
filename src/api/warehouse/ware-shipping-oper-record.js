/** 出库单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareShippingOperRecord`

/** 新增出库单操作日志 */
export const saveWareShippingOperRecord = (data) => request.post(`${url}/save`, data)

/** 出库单操作日志分页查询 */
export const getWareShippingOperRecord = (data) => request.get(`${url}/page`, data)


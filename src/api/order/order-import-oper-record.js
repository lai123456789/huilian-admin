/** 进口订单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderImportOperRecord`

/** 新增进口订单操作日志 */
export const saveOrderImportOperRecord = (data) => request.post(`${url}/save`, data)

/** 进口订单操作日志分页查询 */
export const getOrderImportOperRecord = (data) => request.get(`${url}/page`, data)


/** 入库单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareReceivingOperRecord`

/** 新增入库单操作日志 */
export const saveWareReceivingOperRecord = (data) => request.post(`${url}/save`, data)

/** 入库单操作日志分页查询 */
export const getWareReceivingOperRecord = (data) => request.get(`${url}/page`, data)


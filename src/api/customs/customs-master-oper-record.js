/** 报关单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsMasterOperRecord`

/** 新增报关单操作日志 */
export const saveCustomsMasterOperRecord = (data) => request.post(`${url}/save`, data)

/** 报关单操作日志分页查询 */
export const getCustomsMasterOperRecord = (data) => request.get(`${url}/page`, data)


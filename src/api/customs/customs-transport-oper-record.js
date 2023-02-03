/** 报关运输单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsTransportOperRecord`

/** 新增报关运输单操作日志 */
export const saveCustomsTransportOperRecord = (data) => request.post(`${url}/save`, data)

/** 报关运输单操作日志分页查询 */
export const getCustomsTransportOperRecord = (data) => request.get(`${url}/page`, data)


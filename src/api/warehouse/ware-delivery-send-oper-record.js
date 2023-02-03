/** 调度送货单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareDeliverySendOperRecord`

/** 新增调度送货单操作日志 */
export const saveWareDeliverySendOperRecord = (data) => request.post(`${url}/save`, data)

/** 调度送货单操作日志分页查询 */
export const getWareDeliverySendOperRecord = (data) => request.get(`${url}/page`, data)


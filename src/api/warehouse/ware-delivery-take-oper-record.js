/** 客户自提单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareDeliveryTakeOperRecord`

/** 新增客户自提单操作日志 */
export const saveWareDeliveryTakeOperRecord = (data) => request.post(`${url}/save`, data)

/** 客户自提单操作日志分页查询 */
export const getWareDeliveryTakeOperRecord = (data) => request.get(`${url}/page`, data)


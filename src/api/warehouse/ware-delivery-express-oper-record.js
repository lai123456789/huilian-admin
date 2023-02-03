/** 快递发货单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareDeliveryExpressOperRecord`

/** 新增快递发货单操作日志 */
export const saveWareDeliveryExpressOperRecord = (data) => request.post(`${url}/save`, data)

/** 快递发货单操作日志分页查询 */
export const getWareDeliveryExpressOperRecord = (data) => request.get(`${url}/page`, data)


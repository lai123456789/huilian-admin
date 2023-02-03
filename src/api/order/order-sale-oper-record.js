/** 销售订单操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderSaleOperRecord`

/** 新增销售订单操作日志 */
export const saveOrderSaleOperRecord = (data) => request.post(`${url}/save`, data)

/** 销售订单操作日志分页查询 */
export const getOrderSaleOperRecord = (data) => request.get(`${url}/page`, data)


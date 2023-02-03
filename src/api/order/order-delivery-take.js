/** 订单收货信息 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderDeliveryTake`

/** 新增订单收货信息 */
export const saveOrderDeliveryTake = (data) => request.post(`${url}/save`, data)

/** 通过id删除订单收货信息 */
export const deleteOrderDeliveryTakeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改订单收货信息 */
export const updateOrderDeliveryTake = (data) => request.post(`${url}/update`, data)


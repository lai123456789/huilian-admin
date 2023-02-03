/** 订单送货信息 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderDeliverySend`

/** 新增订单送货信息 */
export const saveOrderDeliverySend = (data) => request.post(`${url}/save`, data)

/** 通过id删除订单送货信息 */
export const deleteOrderDeliverySendById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改订单送货信息 */
export const updateOrderDeliverySend = (data) => request.post(`${url}/update`, data)


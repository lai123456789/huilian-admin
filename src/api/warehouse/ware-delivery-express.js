/** 快递发货单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareDeliveryExpress`

/** 新增快递发货单 */
export const saveWareDeliveryExpress = (data) => request.post(`${url}/save`, data)

/** 通过id删除快递发货单 */
export const deleteWareDeliveryExpressById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改快递发货单 */
export const updateWareDeliveryExpress = (data) => request.post(`${url}/update`, data)

/** 快递发货单分页查询 */
export const getWareDeliveryExpress = (data) => request.get(`${url}/page`, data)

/** 快递发货单通过id查询 */
export const getWareDeliveryExpressById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 快递发货单查询审批记录 */
export const getWareDeliveryExpressAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核快递发货单 */
export const auditWareDeliveryExpress = (data) => request.post(`${url}/audit`, data)

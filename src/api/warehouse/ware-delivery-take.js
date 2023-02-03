/** 客户自提单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareDeliveryTake`

/** 新增客户自提单 */
export const saveWareDeliveryTake = (data) => request.post(`${url}/save`, data)

/** 通过id删除客户自提单 */
export const deleteWareDeliveryTakeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改客户自提单 */
export const updateWareDeliveryTake = (data) => request.post(`${url}/update`, data)

/** 客户自提单分页查询 */
export const getWareDeliveryTake = (data) => request.get(`${url}/page`, data)

/** 客户自提单通过id查询 */
export const getWareDeliveryTakeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 客户自提单查询审批记录 */
export const getWareDeliveryTakeAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核客户自提单 */
export const auditWareDeliveryTake = (data) => request.post(`${url}/audit`, data)

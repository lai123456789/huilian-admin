/** 仓储订单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderStorage`

/** 新增仓储订单 */
export const saveOrderStorage = (data) => request.post(`${url}/save`, data)

/** 通过id删除仓储订单 */
export const deleteOrderStorageById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改仓储订单 */
export const updateOrderStorage = (data) => request.post(`${url}/update`, data)

/** 仓储订单分页查询 */
export const getOrderStorage = (data) => request.get(`${url}/page`, data)

/** 仓储订单通过id查询 */
export const getOrderStorageById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 仓储订单查询审批记录 */
export const getOrderStorageAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核仓储订单 */
export const auditOrderStorage = (data) => request.post(`${url}/audit`, data)


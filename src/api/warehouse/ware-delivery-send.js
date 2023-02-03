/** 调度送货单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareDeliverySend`

/** 新增调度送货单 */
export const saveWareDeliverySend = (data) => request.post(`${url}/save`, data)

/** 通过id删除调度送货单 */
export const deleteWareDeliverySendById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改调度送货单 */
export const updateWareDeliverySend = (data) => request.post(`${url}/update`, data)

/** 调度送货单分页查询 */
export const getWareDeliverySend = (data) => request.get(`${url}/page`, data)

/** 调度送货单通过id查询 */
export const getWareDeliverySendById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 调度送货单查询审批记录 */
export const getWareDeliverySendAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核调度送货单 */
export const auditWareDeliverySend = (data) => request.post(`${url}/audit`, data)

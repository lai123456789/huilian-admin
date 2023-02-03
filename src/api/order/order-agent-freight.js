/** 货代订单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentFreight`

/** 新增货代订单 */
export const saveOrderAgentFreight = (data) => request.post(`${url}/save`, data)

/** 通过id删除货代订单 */
export const deleteOrderAgentFreightById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改货代订单 */
export const updateOrderAgentFreight = (data) => request.post(`${url}/update`, data)

/** 货代订单分页查询 */
export const getOrderAgentFreight = (data) => request.get(`${url}/page`, data)

/** 货代订单通过id查询 */
export const getOrderAgentFreightById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 货代订单查询审批记录 */
export const getOrderAgentFreightAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核货代订单 */
export const auditOrderAgentFreight = (data) => request.post(`${url}/audit`, data)


/** 报关运输单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsTransport`

/** 新增报关运输单 */
export const saveCustomsTransport = (data) => request.post(`${url}/save`, data)

/** 通过id删除报关运输单 */
export const deleteCustomsTransportById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改报关运输单 */
export const updateCustomsTransport = (data) => request.post(`${url}/update`, data)

/** 报关运输单分页查询 */
export const getCustomsTransport = (data) => request.get(`${url}/page`, data)

/** 报关运输单通过id查询 */
export const getCustomsTransportById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 报关运输单查询审批记录 */
export const getCustomsTransportAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核报关运输单 */
export const auditCustomsTransport = (data) => request.post(`${url}/audit`, data)

/** 绑定报关单 */
export const bindCustomsCustomsTransport = (data) => request.post(`${url}/bindCustoms`, data, { transferMode: 'form' })

/** 解绑报关单 */
export const unBindCustomsCustomsTransport = (data) => request.post(`${url}/unBindCustoms`, data, { transferMode: 'form' })

/** 变更运输状态（已到货） */
export const checkArrivedCustomsTransport = (id) => request.post(`${url}/checkArrived`, { id }, { transferMode: 'path' })

/** 变更运输状态（运输中） */
export const checkShippedCustomsTransport = (id) => request.post(`${url}/checkShipped`, { id }, { transferMode: 'path' })

/** 运输状态回退 */
export const checkRollBackCustomsTransport = (id) => request.post(`${url}/checkRollBack`, { id }, { transferMode: 'path' })

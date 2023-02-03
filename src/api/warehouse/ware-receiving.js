/** 入库单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareReceiving`

/** 新增入库单 */
export const saveWareReceiving = (data) => request.post(`${url}/save`, data)

/** 通过id删除入库单 */
export const deleteWareReceivingById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改入库单 */
export const updateWareReceiving = (data) => request.post(`${url}/update`, data)

/** 入库单分页查询 */
export const getWareReceiving = (data) => request.get(`${url}/page`, data)

/** 入库单通过id查询 */
export const getWareReceivingById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 入库单查询审批记录 */
export const getWareReceivingAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核入库单 */
export const auditWareReceiving = (data) => request.post(`${url}/audit`, data)

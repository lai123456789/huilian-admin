/** 客户认证 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusAuth`

/** 通过id删除客户认证 */
export const deleteCompanyCusAuthById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 客户认证分页查询 */
export const getCompanyCusAuth = (data) => request.get(`${url}/page`, data)

/** 客户认证通过id查询 */
export const getCompanyCusAuthById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 客户认证查询审批记录 */
export const getCompanyCusAuthAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核客户认证 */
export const auditCompanyCusAuth = (data) => request.post(`${url}/audit`, data)


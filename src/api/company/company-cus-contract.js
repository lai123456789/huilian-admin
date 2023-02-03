/** 客户服务协议 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusContract`

/** 新增客户服务协议 */
export const saveCompanyCusContract = (data) => request.post(`${url}/save`, data)

/** 通过id删除客户服务协议 */
export const deleteCompanyCusContractById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改客户服务协议 */
export const updateCompanyCusContract = (data) => request.post(`${url}/update`, data)

/** 客户服务协议分页查询 */
export const getCompanyCusContract = (data) => request.get(`${url}/page`, data)

/** 客户服务协议通过id查询 */
export const getCompanyCusContractById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 客户服务协议查询审批记录 */
export const getCompanyCusContractAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核客户服务协议 */
export const auditCompanyCusContract = (data) => request.post(`${url}/audit`, data)

/** 客户服务协议-作废 */
export const toVoidCompanyCusContract = (data) => request.get(`${url}/toVoid`, data)

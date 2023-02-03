/** 客户额度记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/riskCusQuotaRecord`

/** 新增客户额度记录 */
export const saveRiskCusQuotaRecord = (data) => request.post(`${url}/save`, data)

/** 通过id删除客户额度记录 */
export const deleteRiskCusQuotaRecordById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改客户额度记录 */
export const updateRiskCusQuotaRecord = (data) => request.post(`${url}/update`, data)

/** 客户额度记录分页查询 */
export const getRiskCusQuotaRecord = (data) => request.get(`${url}/page`, data)

/** 客户额度记录通过id查询 */
export const getRiskCusQuotaRecordById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 客户额度记录查询审批记录 */
export const getRiskCusQuotaRecordAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核客户额度记录 */
export const auditRiskCusQuotaRecord = (data) => request.post(`${url}/audit`, data)

/** 客户额度记录-作废 */
export const toVoidRiskCusQuotaRecord = (data) => request.get(`${url}/toVoid`, data)

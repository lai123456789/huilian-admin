/** 进项票 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctReceiveInvoice`

/** 新增进项票 */
export const saveAcctReceiveInvoice = (data) => request.post(`${url}/save`, data)

/** 通过id删除进项票 */
export const deleteAcctReceiveInvoiceById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改进项票 */
export const updateAcctReceiveInvoice = (data) => request.post(`${url}/update`, data)

/** 进项票分页查询 */
export const getAcctReceiveInvoice = (data) => request.get(`${url}/page`, data)

/** 进项票通过id查询 */
export const getAcctReceiveInvoiceById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 进项票查询审批记录 */
export const getAcctReceiveInvoiceAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核进项票 */
export const auditAcctReceiveInvoice = (data) => request.post(`${url}/audit`, data)

/** 进项票-批量变更函调状态 */
export const updateFunctionCallAcctReceiveInvoice = (data) => request.post(`${url}/updateFunctionCall`, data, { transferMode: 'form' })


/** 销项票 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctMakeInvoice`

/** 新增销项票 */
export const saveAcctMakeInvoice = (data) => request.post(`${url}/save`, data)

/** 通过id删除销项票 */
export const deleteAcctMakeInvoiceById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 销项票分页查询 */
export const getAcctMakeInvoice = (data) => request.get(`${url}/page`, data)

/** 销项票通过id查询 */
export const getAcctMakeInvoiceById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 销项票查询审批记录 */
export const getAcctMakeInvoiceAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核销项票 */
export const auditAcctMakeInvoice = (data) => request.post(`${url}/audit`, data)

/** 录入税票信息 */
export const inputAcctMakeInvoice = (data) => request.post(`${url}/input`, data)

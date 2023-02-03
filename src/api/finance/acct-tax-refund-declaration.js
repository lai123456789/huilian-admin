/** 退税申报 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctTaxRefundDeclaration`

/** 新增退税申报 */
export const saveAcctTaxRefundDeclaration = (data) => request.post(`${url}/save`, data)

/** 通过id删除退税申报 */
export const deleteAcctTaxRefundDeclarationById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 退税申报分页查询 */
export const getAcctTaxRefundDeclaration = (data) => request.get(`${url}/page`, data)

/** 退税申报通过id查询 */
export const getAcctTaxRefundDeclarationById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 退税申报查询审批记录 */
export const getAcctTaxRefundDeclarationAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核退税申报 */
export const auditAcctTaxRefundDeclaration = (data) => request.post(`${url}/audit`, data)

/** 退税申报-录入审批时间 */
export const inputApprovalTimeAcctTaxRefundDeclaration = (data) => request.post(`${url}/inputApprovalTime`, data, { transferMode: 'form' })

/** 退税申报-退账单到账 */
export const refundToAccountAcctTaxRefundDeclaration = (data) => request.post(`${url}/refundToAccount`, data, { transferMode: 'form' })

/** 移除退税申报 */
export const removeAcctTaxRefundDeclaration = (taxInvoiceId) => request.post(`${url}/remove`, { taxInvoiceId }, { transferMode: 'path' })

/** 退税申报-交单 */
export const updateBillAcctTaxRefundDeclaration = (data) => request.post(`${url}/updateBill`, data, { transferMode: 'form' })

/** 退税申报-取消交单 */
export const unUpdateBillAcctTaxRefundDeclaration = (data) => request.post(`${url}/unUpdateBill`, data, { transferMode: 'form' })

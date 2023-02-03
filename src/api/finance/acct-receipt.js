/** 收款单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctReceipt`
export const acctReceiptImportUrl = `${url}/importAcctReceipt`
export const acctReceiptExportUrl = `${url}/exportAcctReceipt`

/** 新增收款单 */
export const saveAcctReceipt = (data) => request.post(`${url}/save`, data)

/** 通过id删除收款单 */
export const deleteAcctReceiptById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改收款单 */
export const updateAcctReceipt = (data) => request.post(`${url}/update`, data)

/** 收款单分页查询 */
export const getAcctReceipt = (data) => request.get(`${url}/page`, data)

/** 收款单通过id查询 */
export const getAcctReceiptById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 收款单查询审批记录 */
export const getAcctReceiptAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核收款单 */
export const auditAcctReceipt = (data) => request.post(`${url}/audit`, data)

/** 出口结汇 */
export const exportSettlementAcctReceipt = (data) => request.post(`${url}/exportSettlement`, data)

/** 进口预付汇-付汇 */
export const importPaymentAcctReceipt = (data) => request.post(`${url}/importPayment`, data)

/** 修改锁定金额 */
export const updateLockMoneyAcctReceipt = (data) => request.post(`${url}/updateLockMoney`, data, { transferMode: 'form' })

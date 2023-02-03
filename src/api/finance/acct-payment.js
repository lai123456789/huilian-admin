/** 付款单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctPayment`

/** 新增付款单 */
export const saveAcctPayment = (data) => request.post(`${url}/save`, data)

/** 通过id删除付款单 */
export const deleteAcctPaymentById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改付款单 */
export const updateAcctPayment = (data) => request.post(`${url}/update`, data)

/** 付款单分页查询 */
export const getAcctPayment = (data) => request.get(`${url}/page`, data)

/** 付款单通过id查询 */
export const getAcctPaymentById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 付款单查询审批记录 */
export const getAcctPaymentAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核付款单 */
export const auditAcctPayment = (data) => request.post(`${url}/audit`, data)

/** 确认付款 */
export const confimAcctPayment = (data) => request.post(`${url}/confim`, data)

/** 取消付款 */
export const unConfimAcctPayment = (id) => request.post(`${url}/unConfim`, { id }, { transferMode: 'path' })


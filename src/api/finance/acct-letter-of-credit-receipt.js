/** 信用证收证 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctLetterOfCreditReceipt`

/** 新增信用证收证 */
export const saveAcctLetterOfCreditReceipt = (data) => request.post(`${url}/save`, data)

/** 通过id删除信用证收证 */
export const deleteAcctLetterOfCreditReceiptById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改信用证收证 */
export const updateAcctLetterOfCreditReceipt = (data) => request.post(`${url}/update`, data)

/** 信用证收证分页查询 */
export const getAcctLetterOfCreditReceipt = (data) => request.get(`${url}/page`, data)

/** 信用证收证通过id查询 */
export const getAcctLetterOfCreditReceiptById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


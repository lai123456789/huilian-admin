/** 银行承兑汇票 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctBankAcceptance`

/** 新增银行承兑汇票 */
export const saveAcctBankAcceptance = (data) => request.post(`${url}/save`, data)

/** 通过id删除银行承兑汇票 */
export const deleteAcctBankAcceptanceById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改银行承兑汇票 */
export const updateAcctBankAcceptance = (data) => request.post(`${url}/update`, data)

/** 银行承兑汇票分页查询 */
export const getAcctBankAcceptance = (data) => request.get(`${url}/page`, data)

/** 银行承兑汇票通过id查询 */
export const getAcctBankAcceptanceById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 银行承兑汇票-更新到账信息 */
export const updateArrivalAcctBankAcceptance = (data) => request.post(`${url}/updateArrival`, data, { transferMode: 'form' })

/** 银行承兑汇票-更新贴现信息 */
export const updateDiscountAcctBankAcceptance = (data) => request.post(`${url}/updateDiscount`, data)

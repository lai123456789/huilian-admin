/** 银行承兑汇票背书信息 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctBankAcceptanceEndosement`

/** 新增银行承兑汇票背书信息 */
export const saveAcctBankAcceptanceEndosement = (data) => request.post(`${url}/save`, data)

/** 通过id删除银行承兑汇票背书信息 */
export const deleteAcctBankAcceptanceEndosementById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改银行承兑汇票背书信息 */
export const updateAcctBankAcceptanceEndosement = (data) => request.post(`${url}/update`, data)

/** 银行承兑汇票背书信息分页查询 */
export const getAcctBankAcceptanceEndosement = (data) => request.get(`${url}/page`, data)

/** 银行承兑汇票背书信息通过id查询 */
export const getAcctBankAcceptanceEndosementById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


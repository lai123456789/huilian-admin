/** 信用证开证-到单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctLetterOfCreditArrival`

/** 新增信用证开证-到单 */
export const saveAcctLetterOfCreditArrival = (data) => request.post(`${url}/save`, data)

/** 通过id删除信用证开证-到单 */
export const deleteAcctLetterOfCreditArrivalById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改信用证开证-到单 */
export const updateAcctLetterOfCreditArrival = (data) => request.post(`${url}/update`, data)

/** 信用证开证-到单分页查询 */
export const getAcctLetterOfCreditArrival = (data) => request.get(`${url}/page`, data)

/** 信用证开证-到单通过id查询 */
export const getAcctLetterOfCreditArrivalById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


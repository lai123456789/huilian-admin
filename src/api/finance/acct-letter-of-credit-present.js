/** 信用证收证-交单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctLetterOfCreditPresent`

/** 新增信用证收证-交单 */
export const saveAcctLetterOfCreditPresent = (data) => request.post(`${url}/save`, data)

/** 通过id删除信用证收证-交单 */
export const deleteAcctLetterOfCreditPresentById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改信用证收证-交单 */
export const updateAcctLetterOfCreditPresent = (data) => request.post(`${url}/update`, data)

/** 信用证收证-交单分页查询 */
export const getAcctLetterOfCreditPresent = (data) => request.get(`${url}/page`, data)

/** 信用证收证-交单通过id查询 */
export const getAcctLetterOfCreditPresentById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


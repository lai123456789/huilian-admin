/** 信用证开证 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctLetterOfCreditIssuing`

/** 新增信用证开证 */
export const saveAcctLetterOfCreditIssuing = (data) => request.post(`${url}/save`, data)

/** 通过id删除信用证开证 */
export const deleteAcctLetterOfCreditIssuingById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改信用证开证 */
export const updateAcctLetterOfCreditIssuing = (data) => request.post(`${url}/update`, data)

/** 信用证开证分页查询 */
export const getAcctLetterOfCreditIssuing = (data) => request.get(`${url}/page`, data)

/** 信用证开证通过id查询 */
export const getAcctLetterOfCreditIssuingById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


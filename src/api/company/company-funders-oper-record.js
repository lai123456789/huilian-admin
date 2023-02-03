/** 资金方操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyFundersOperRecord`

/** 新增资金方操作日志 */
export const saveCompanyFundersOperRecord = (data) => request.post(`${url}/save`, data)

/** 资金方操作日志分页查询 */
export const getCompanyFundersOperRecord = (data) => request.get(`${url}/page`, data)


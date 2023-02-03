/** 主体公司操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyPrincipalOperRecord`

/** 新增主体公司操作日志 */
export const saveCompanyPrincipalOperRecord = (data) => request.post(`${url}/save`, data)

/** 主体公司操作日志分页查询 */
export const getCompanyPrincipalOperRecord = (data) => request.get(`${url}/page`, data)


/** 报关行操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCustomsOperRecord`

/** 新增报关行操作日志 */
export const saveCompanyCustomsOperRecord = (data) => request.post(`${url}/save`, data)

/** 报关行操作日志分页查询 */
export const getCompanyCustomsOperRecord = (data) => request.get(`${url}/page`, data)


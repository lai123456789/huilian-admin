/** 承运商操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyTransportOperRecord`

/** 新增承运商操作日志 */
export const saveCompanyTransportOperRecord = (data) => request.post(`${url}/save`, data)

/** 承运商操作日志分页查询 */
export const getCompanyTransportOperRecord = (data) => request.get(`${url}/page`, data)


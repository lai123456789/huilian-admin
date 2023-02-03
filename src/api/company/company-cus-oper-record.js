/** 客户操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusOperRecord`

/** 新增客户操作日志 */
export const saveCompanyCusOperRecord = (data) => request.post(`${url}/save`, data)

/** 客户操作日志分页查询 */
export const getCompanyCusOperRecord = (data) => request.get(`${url}/page`, data)


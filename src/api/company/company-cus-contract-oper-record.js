/** 客户服务协议操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusContractOperRecord`

/** 新增客户服务协议操作日志 */
export const saveCompanyCusContractOperRecord = (data) => request.post(`${url}/save`, data)

/** 客户服务协议操作日志分页查询 */
export const getCompanyCusContractOperRecord = (data) => request.get(`${url}/page`, data)


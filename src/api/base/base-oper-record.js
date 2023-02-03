/**  客户委托->收货信息*/
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusOperRecord`

/** 操作日志 分页查询 */
export const getBaseOperRecord = (data) => request.get(`${url}/page`, data)

/** 新增操作日志 */
export const saveBaseOperRecord = (data) => request.post(`${url}/save`, data)


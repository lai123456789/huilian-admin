/** 日志管理 */
import { request } from '@/api'

const url = `/admin/log`

/** 通过id删除日志 */
export const deleteLogById = (id) => request.delete(url, id)

/** 日志管理分页查询 */
export const getLog = (data) => request.get(`${url}/page`, data)

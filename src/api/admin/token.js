/** 令牌管理 */
import { request } from '@/api'

const url = `/admin/token`

/** 通过token删除令牌 */
export const deleteTokenByToken = (token) => request.delete(url, token)

/** 令牌管理分页查询 */
export const getToken = (data) => request.get(`${url}/page`, data)

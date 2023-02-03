/** 网关路由信息 */
import { request } from '@/api'

const url = `/admin/route`

/** 修改网关路由信息 */
export const updateRoute = (data) => request.put(url, data)

/** 查询所有网关路由信息 */
export const getRoute = (data) => request.get(url, data)


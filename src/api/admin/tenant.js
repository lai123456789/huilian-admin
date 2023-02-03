/** 租户 */
import { request } from '@/api'

const url = `/admin/tenant`

/** 租户分页查询 */
export const getTenant = (data) => request.get(`${url}/page`, data)

/** 租户通过id查询 */
export const getTenantById = (id) => request.get(url, { id }, { transferMode: 'path' })

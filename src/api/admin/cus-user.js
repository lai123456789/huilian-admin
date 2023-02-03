/** B2B */
import { request } from '@/api'

const url = `/admin/sysCusUser`

/** 新增B2B */
export const saveCusUser = (data) => request.post(`${url}/save`, data)

/** 通过id删除B2B*/
export const deleteCusUserById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改B2B */
export const updateCusUser = (data) => request.post(`${url}/update`, data)

/** B2B分页查询 */
export const getCusUser = (data) => request.get(`${url}/page`, data)

/** B2B通过id查询 */
export const getCusUserById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

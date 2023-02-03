/** 第三方账号信息 */
import { request } from '@/api'

const url = `/admin/social`

/** 新增第三方账号信息 */
export const saveSocial = data => request.post(url, data)

/** 通过id删除第三方账号信息 */
export const deleteSocialById = id => request.delete(`${url}`, { id }, { transferMode: 'path' })

/** 修改第三方账号信息 */
export const updateSocial = data => request.put(url, data)

/** 第三方账号信息分页查询 */
export const getSocial = data => request.get(`${url}/page`, data)

/** 第三方账号信息通过id查询 */
export const getSocialById = id => request.get(`${url}/get`, { id }, { transferMode: 'path' })

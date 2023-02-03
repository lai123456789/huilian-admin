/** 在线用户管理 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/sysCusUser`

/** 新增在线用户管理 */
export const saveSysCusUser = (data) => request.post(`${url}/save`, data)

/** 通过id删除在线用户管理 */
export const deleteSysCusUserById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改在线用户管理 */
export const updateSysCusUser = (data) => request.post(`${url}/update`, data)

/** 在线用户管理分页查询 */
export const getSysCusUser = (data) => request.get(`${url}/page`, data)

/** 在线用户管理通过id查询 */
export const getSysCusUserById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 系统用户 */
import { request } from '@/api'

const url = `/admin/user`

/** 新增系统用户 */
export const saveUser = (data) => request.post(url, data)

/** 通过id删除系统用户 */
export const deleteUserById = (id) => request.delete(url, { id }, { transferMode: 'path' })

/** 修改系统用户 */
export const updateUser = (data) => request.put(url, data)

/** 系统用户分页查询 */
export const getUser = (data) => request.get(`${url}/page`, data)

/** 系统用户通过id查询 */
export const getUserById = (id) => request.get(url, { id }, { transferMode: 'path' })

/** 角色管理 */
import { request } from '@/api'

const url = `/admin/role`

/** 新增角色 */
export const saveRole = (data) => request.post(url, data)

/** 通过id删除角色 */
export const deleteRoleById = (id) => request.delete(url, { id }, { transferMode: 'path' })

/** 修改角色 */
export const updateRole = (data) => request.put(url, data)

/** 角色分页查询 */
export const getRole = (data) => request.get(`${url}/page`, data)

/** 角色通过id查询 */
export const getRoleById = (id) => request.get(url, { id }, { transferMode: 'path' })

/** 角色分配权限 */
export const setRoleMenu = (data) => request.put(`${url}/menu`, data)

/** 查询全部角色 */
export const getRoleList = (data) => request.get(`${url}/list`, data)


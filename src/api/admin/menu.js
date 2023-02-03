/** 菜单 */
import { request } from '@/api'

const url = `/admin/menu`

/** 新增菜单 */
export const saveMenu = (data) => request.post(url, data)

/** 通过id删除菜单 */
export const deleteMenuById = (id) => request.delete(url, { id }, { transferMode: 'path' })

/** 修改菜单 */
export const updateMenu = (data) => request.put(url, data)

/** 查询菜单树 */
export const getMenuTree = (data) => request.get(`${url}/tree`, data)

/** 菜单管理-根据角色ID，查询角色拥有的菜单ID集合 */
export const getMenuTreeById = (roleId) => request.get(`${url}/tree`, { roleId }, { transferMode: 'path' })

/** 查询当前用户的树形菜单 */
export const getCurrentUserMenu = (data) => request.get(url, data)

/** 菜单通过id查询 */
export const getMenuById = (id) => request.get(url, { id }, { transferMode: 'path' })

/** 菜单管理-通过菜单权限标识查询 */
export const getMenuByPermission = (data) => request.post(`${url}/getByPermission`, data, { transferMode: 'form' })

/** 菜单管理-更新业务说明 */
export const updateBusinessNotesMenu = (data) => request.post(`${url}/updateBusinessNotes`, data, { transferMode: 'form' })

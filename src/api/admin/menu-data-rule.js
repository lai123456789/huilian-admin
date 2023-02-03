/** 菜单权限规则 */
import { request } from '@/api'

const url = `/admin/menuDataRule`

/** 新增菜单权限规则 */
export const saveMenuDataRule = (data) => request.post(url, data)

/** 通过id删除菜单权限规则 */
export const deleteMenuDataRuleById = (id) => request.delete(url, id)

/** 修改菜单权限规则 */
export const updateMenuDataRule = (data) => request.put(url, data)

/** 菜单权限规则分页查询 */
export const getMenuDataRule = (data) => request.get(`${url}/page`, data)

/** 菜单权限规则通过id查询 */
export const getMenuDataRuleById = (id) => request.get(url, { id }, { transferMode: 'path' })

/** 根据菜单id+角色id，获取数据权限规则 */
export const getMenuDataRuleByMenuIdAndRoleId = (menuId, roleId) => request.get(`${url}/queryDataRule`, { menuId, roleId }, { transferMode: 'path' })

/** 角色分配权限规则 */
export const saveDataRuleMenuDataRule = (data) => request.post(`${url}/saveDataRule`, data)

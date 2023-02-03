/** 部门管理 */
import { request } from '@/api'

const url = `/admin/dept`

/** 新增部门 */
export const saveDept = (data) => request.post(url, data)

/** 通过id删除部门 */
export const deleteDeptById = (id) => request.delete(url, id, { transferMode: 'path' })

/** 修改部门 */
export const updateDept = (data) => request.put(url, data)

/** 部门分页查询 */
export const getDept = (data) => request.get(`${url}/page`, data)

/** 部门通过id查询 */
export const getDeptById = (id) => request.get(url, { id }, { transferMode: 'path' })

/** 查询部门树 */
export const getDeptTree = (data) => request.get(`${url}/tree`, data)

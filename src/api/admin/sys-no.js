/** 系统编码 */
import { request } from '@/api'

const url = `/admin/sysNo`

/** 新增系统编码 */
export const saveSysNo = (data) => request.post(`${url}/save`, data)

/** 通过id删除系统编码 */
export const deleteSysNoById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改系统编码 */
export const updateSysNo = (data) => request.post(`${url}/update`, data)

/** 系统编码分页查询 */
export const getSysNo = (data) => request.get(`${url}/page`, data)

/** 系统编码通过id查询 */
export const getSysNoById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

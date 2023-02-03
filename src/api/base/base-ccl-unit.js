/** 计量单位代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclUnit`

/** 新增计量单位代码 */
export const saveBaseCclUnit = (data) => request.post(`${url}/save`, data)

/** 通过id删除计量单位代码 */
export const deleteBaseCclUnitById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改计量单位代码 */
export const updateBaseCclUnit = (data) => request.post(`${url}/update`, data)

/** 计量单位代码分页查询 */
export const getBaseCclUnit = (data) => request.get(`${url}/page`, data)

/** 计量单位代码通过id查询 */
export const getBaseCclUnitById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

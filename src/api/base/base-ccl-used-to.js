/** 用途代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclUsedTo`

/** 新增用途代码 */
export const saveBaseCclUsedTo = (data) => request.post(`${url}/save`, data)

/** 通过id删除用途代码 */
export const deleteBaseCclUsedToById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改用途代码 */
export const updateBaseCclUsedTo = (data) => request.post(`${url}/update`, data)

/** 用途代码分页查询 */
export const getBaseCclUsedTo = (data) => request.get(`${url}/page`, data)

/** 用途代码通过id查询 */
export const getBaseCclUsedToById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


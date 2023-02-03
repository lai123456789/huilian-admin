/** 关区代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclCustoms`

/** 新增关区代码 */
export const saveBaseCclCustoms = (data) => request.post(`${url}/save`, data)

/** 通过id删除关区代码 */
export const deleteBaseCclCustomsById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改关区代码 */
export const updateBaseCclCustoms = (data) => request.post(`${url}/update`, data)

/** 关区代码分页查询 */
export const getBaseCclCustoms = (data) => request.get(`${url}/page`, data)

/** 关区代码通过id查询 */
export const getBaseCclCustomsById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


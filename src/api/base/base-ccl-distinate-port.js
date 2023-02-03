/** 港口代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclDistinatePort`

/** 新增港口代码 */
export const saveBaseCclDistinatePort = (data) => request.post(`${url}/save`, data)

/** 通过id删除港口代码 */
export const deleteBaseCclDistinatePortById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改港口代码 */
export const updateBaseCclDistinatePort = (data) => request.post(`${url}/update`, data)

/** 港口代码分页查询 */
export const getBaseCclDistinatePort = (data) => request.get(`${url}/page`, data)

/** 港口代码通过id查询 */
export const getBaseCclDistinatePortById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


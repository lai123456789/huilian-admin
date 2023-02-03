/** 征免性质代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclLevyType`

/** 新增征免性质代码 */
export const saveBaseCclLevyType = (data) => request.post(`${url}/save`, data)

/** 通过id删除征免性质代码 */
export const deleteBaseCclLevyTypeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改征免性质代码 */
export const updateBaseCclLevyType = (data) => request.post(`${url}/update`, data)

/** 征免性质代码分页查询 */
export const getBaseCclLevyType = (data) => request.get(`${url}/page`, data)

/** 征免性质代码通过id查询 */
export const getBaseCclLevyTypeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

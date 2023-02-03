/** 征减免税方式代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclLevymode`

/** 新增征减免税方式代码 */
export const saveBaseCclLevymode = (data) => request.post(`${url}/save`, data)

/** 通过id删除征减免税方式代码 */
export const deleteBaseCclLevymodeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改征减免税方式代码 */
export const updateBaseCclLevymode = (data) => request.post(`${url}/update`, data)

/** 征减免税方式代码分页查询 */
export const getBaseCclLevymode = (data) => request.get(`${url}/page`, data)

/** 征减免税方式代码通过id查询 */
export const getBaseCclLevymodeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

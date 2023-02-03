/** 国内行政区划（目的地）代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclDestCode`

/** 新增国内行政区划（目的地）代码 */
export const saveBaseCclDestCode = (data) => request.post(`${url}/save`, data)

/** 通过id删除国内行政区划（目的地）代码 */
export const deleteBaseCclDestCodeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改国内行政区划（目的地）代码 */
export const updateBaseCclDestCode = (data) => request.post(`${url}/update`, data)

/** 国内行政区划（目的地）代码分页查询 */
export const getBaseCclDestCode = (data) => request.get(`${url}/page`, data)

/** 国内行政区划（目的地）代码通过id查询 */
export const getBaseCclDestCodeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


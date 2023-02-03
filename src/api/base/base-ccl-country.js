/** 国别（地区）代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclCountry`

/** 新增国别（地区）代码 */
export const saveBaseCclCountry = (data) => request.post(`${url}/save`, data)

/** 通过id删除国别（地区）代码 */
export const deleteBaseCclCountryById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改国别（地区）代码 */
export const updateBaseCclCountry = (data) => request.post(`${url}/update`, data)

/** 国别（地区）代码分页查询 */
export const getBaseCclCountry = (data) => request.get(`${url}/page`, data)

/** 国别（地区）代码通过id查询 */
export const getBaseCclCountryById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


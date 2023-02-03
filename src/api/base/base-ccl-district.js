/** 国内(地区)代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclDistrict`

/** 新增国内(地区)代码 */
export const saveBaseCclDistrict = (data) => request.post(`${url}/save`, data)

/** 通过id删除国内(地区)代码 */
export const deleteBaseCclDistrictById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改国内(地区)代码 */
export const updateBaseCclDistrict = (data) => request.post(`${url}/update`, data)

/** 国内(地区)代码分页查询 */
export const getBaseCclDistrict = (data) => request.get(`${url}/page`, data)

/** 国内(地区)代码通过id查询 */
export const getBaseCclDistrictById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

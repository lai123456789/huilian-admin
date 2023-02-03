/** 地区性质代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclRegionNature`

/** 新增地区性质代码 */
export const saveBaseCclRegionNature = (data) => request.post(`${url}/save`, data)

/** 通过id删除地区性质代码 */
export const deleteBaseCclRegionNatureById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改地区性质代码 */
export const updateBaseCclRegionNature = (data) => request.post(`${url}/update`, data)

/** 地区性质代码分页查询 */
export const getBaseCclRegionNature = (data) => request.get(`${url}/page`, data)

/** 地区性质代码通过id查询 */
export const getBaseCclRegionNatureById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

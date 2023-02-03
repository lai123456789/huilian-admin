/** 原产地区代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclOrigPlaceCode`

/** 新增原产地区代码 */
export const saveBaseCclOrigPlaceCode = (data) => request.post(`${url}/save`, data)

/** 通过id删除原产地区代码 */
export const deleteBaseCclOrigPlaceCodeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改原产地区代码 */
export const updateBaseCclOrigPlaceCode = (data) => request.post(`${url}/update`, data)

/** 原产地区代码分页查询 */
export const getBaseCclOrigPlaceCode = (data) => request.get(`${url}/page`, data)

/** 原产地区代码通过id查询 */
export const getBaseCclOrigPlaceCodeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


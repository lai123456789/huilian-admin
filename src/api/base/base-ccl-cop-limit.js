/** 企业资质代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclCopLimit`

/** 新增企业资质代码 */
export const saveBaseCclCopLimit = (data) => request.post(`${url}/save`, data)

/** 通过id删除企业资质代码 */
export const deleteBaseCclCopLimitById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改企业资质代码 */
export const updateBaseCclCopLimit = (data) => request.post(`${url}/update`, data)

/** 企业资质代码分页查询 */
export const getBaseCclCopLimit = (data) => request.get(`${url}/page`, data)

/** 企业资质代码通过id查询 */
export const getBaseCclCopLimitById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

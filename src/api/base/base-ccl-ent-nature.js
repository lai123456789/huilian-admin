/** 企业性质代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclEntNature`

/** 新增企业性质代码 */
export const saveBaseCclEntNature = (data) => request.post(`${url}/save`, data)

/** 通过id删除企业性质代码 */
export const deleteBaseCclEntNatureById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改企业性质代码 */
export const updateBaseCclEntNature = (data) => request.post(`${url}/update`, data)

/** 企业性质代码分页查询 */
export const getBaseCclEntNature = (data) => request.get(`${url}/page`, data)

/** 企业性质代码通过id查询 */
export const getBaseCclEntNatureById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


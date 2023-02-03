/** 检验检疫机关代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclOrgCode`

/** 新增检验检疫机关代码 */
export const saveBaseCclOrgCode = (data) => request.post(`${url}/save`, data)

/** 通过id删除检验检疫机关代码 */
export const deleteBaseCclOrgCodeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改检验检疫机关代码 */
export const updateBaseCclOrgCode = (data) => request.post(`${url}/update`, data)

/** 检验检疫机关代码分页查询 */
export const getBaseCclOrgCode = (data) => request.get(`${url}/page`, data)

/** 检验检疫机关代码通过id查询 */
export const getBaseCclOrgCodeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

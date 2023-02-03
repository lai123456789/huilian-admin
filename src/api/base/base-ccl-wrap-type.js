/** 包装种类代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclWrapType`

/** 新增包装种类代码 */
export const saveBaseCclWrapType = (data) => request.post(`${url}/save`, data)

/** 通过id删除包装种类代码 */
export const deleteBaseCclWrapTypeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改包装种类代码 */
export const updateBaseCclWrapType = (data) => request.post(`${url}/update`, data)

/** 包装种类代码分页查询 */
export const getBaseCclWrapType = (data) => request.get(`${url}/page`, data)

/** 包装种类代码通过id查询 */
export const getBaseCclWrapTypeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 只查询系统业务支持的包装种类代码 */
// export const getBaseCclWrapTypeSupportWrapTypeList = (data) => request.get(`${url}/supportWrapTypeList`, data)


/** 监管证件代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclLicenseDocu`

/** 新增监管证件代码 */
export const saveBaseCclLicenseDocu = (data) => request.post(`${url}/save`, data)

/** 通过id删除监管证件代码 */
export const deleteBaseCclLicenseDocuById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改监管证件代码 */
export const updateBaseCclLicenseDocu = (data) => request.post(`${url}/update`, data)

/** 监管证件代码分页查询 */
export const getBaseCclLicenseDocu = (data) => request.get(`${url}/page`, data)

/** 监管证件代码通过id查询 */
export const getBaseCclLicenseDocuById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

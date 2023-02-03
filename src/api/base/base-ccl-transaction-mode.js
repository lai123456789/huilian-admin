/** 成交方式代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclTransactionMode`

/** 新增成交方式代码 */
export const saveBaseCclTransactionMode = (data) => request.post(`${url}/save`, data)

/** 通过id删除成交方式代码 */
export const deleteBaseCclTransactionModeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改成交方式代码 */
export const updateBaseCclTransactionMode = (data) => request.post(`${url}/update`, data)

/** 成交方式代码分页查询 */
export const getBaseCclTransactionMode = (data) => request.get(`${url}/page`, data)

/** 成交方式代码通过id查询 */
export const getBaseCclTransactionModeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 只查询系统业务支持的成交方式 */
export const getBaseCclTransactionModeSupportWrapTypeList = (data) => request.get(`${url}/supportTransactionModeList`, data)


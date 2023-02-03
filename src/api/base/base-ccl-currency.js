/** 币制代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclCurrency`

/** 新增币制代码 */
export const saveBaseCclCurrency = (data) => request.post(`${url}/save`, data)

/** 通过id删除币制代码 */
export const deleteBaseCclCurrencyById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改币制代码 */
export const updateBaseCclCurrency = (data) => request.post(`${url}/update`, data)

/** 币制代码分页查询 */
export const getBaseCclCurrency = (data) => request.get(`${url}/page`, data)

/** 币制代码通过id查询 */
export const getBaseCclCurrencyById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

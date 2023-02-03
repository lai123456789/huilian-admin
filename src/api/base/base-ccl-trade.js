/** 监管方式代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclTrade`

/** 新增监管方式代码 */
export const saveBaseCclTrade = (data) => request.post(`${url}/save`, data)

/** 通过id删除监管方式代码 */
export const deleteBaseCclTradeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改监管方式代码 */
export const updateBaseCclTrade = (data) => request.post(`${url}/update`, data)

/** 监管方式代码分页查询 */
export const getBaseCclTrade = (data) => request.get(`${url}/page`, data)

/** 监管方式代码通过id查询 */
export const getBaseCclTradeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


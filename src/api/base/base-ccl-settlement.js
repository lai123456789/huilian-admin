/** 结汇方式代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclSettlement`

/** 新增结汇方式代码 */
export const saveBaseCclSettlement = (data) => request.post(`${url}/save`, data)

/** 通过id删除结汇方式代码 */
export const deleteBaseCclSettlementById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改结汇方式代码 */
export const updateBaseCclSettlement = (data) => request.post(`${url}/update`, data)

/** 结汇方式代码分页查询 */
export const getBaseCclSettlement = (data) => request.get(`${url}/page`, data)

/** 结汇方式代码通过id查询 */
export const getBaseCclSettlementById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 记账汇率 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseAccountRate`

/** 新增记账汇率 */
export const saveBaseAccountRate = (data) => request.post(`${url}/save`, data)

/** 通过id删除记账汇率 */
export const deleteBaseAccountRateById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改记账汇率 */
export const updateBaseAccountRate = (data) => request.post(`${url}/update`, data)

/** 记账汇率分页查询 */
export const getBaseAccountRate = (data) => request.get(`${url}/page`, data)

/** 记账汇率通过id查询 */
export const getBaseAccountRateById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


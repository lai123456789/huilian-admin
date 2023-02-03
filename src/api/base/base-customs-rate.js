/** 海关汇率 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCustomsRate`

/** 新增海关汇率 */
export const saveBaseCustomsRate = (data) => request.post(`${url}/save`, data)

/** 通过id删除海关汇率 */
export const deleteBaseCustomsRateById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改海关汇率 */
export const updateBaseCustomsRate = (data) => request.post(`${url}/update`, data)

/** 海关汇率分页查询 */
export const getBaseCustomsRate = (data) => request.get(`${url}/page`, data)

/** 海关汇率通过id查询 */
export const getBaseCustomsRateById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 同步海关汇率 */
export const syncCustomsRateBaseCustomsRate = (data) => request.post(`${url}/syncCustomsRate`, data, { transferMode: 'form' })

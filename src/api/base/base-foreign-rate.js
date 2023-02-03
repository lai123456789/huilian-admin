/** 外汇汇率 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseForeignRate`

/** 新增外汇汇率 */
export const saveBaseForeignRate = (data) => request.post(`${url}/save`, data)

/** 通过id删除外汇汇率 */
export const deleteBaseForeignRateById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改外汇汇率 */
export const updateBaseForeignRate = (data) => request.post(`${url}/update`, data)

/** 外汇汇率分页查询 */
export const getBaseForeignRate = (data) => request.get(`${url}/page`, data)

/** 外汇汇率通过id查询 */
export const getBaseForeignRateById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 同步中国银行外汇牌价 */
export const syncChinaRateBaseForeignRate = (data) => request.post(`${url}/syncChinaRate`, data, { transferMode: 'form' })

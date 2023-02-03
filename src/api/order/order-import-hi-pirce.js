/** 进口订单-审价处理 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderImport/hiPrice`

/** 进口订单-审价分页查询 */
export const getOrderImportHiPrice = (data) => request.get(`${url}/page`, data)

/** 进口订单-重置审价 */
export const resetHiPriceOrderImportHiPrice = (id) => request.post(`${url}/resetHiPrice`, { id }, { transferMode: 'path' })

/** 进口订单-审价处理 */
export const reviewHiPriceOrderImportHiPrice = (data) => request.post(`${url}/reviewHiPrice`, data, { transferMode: 'form' })


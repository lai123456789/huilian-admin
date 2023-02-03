/** 出口订单-审价处理 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderExport/hiPrice`

/** 出口订单-审价分页查询 */
export const getOrderExportHiPrice = (data) => request.get(`${url}/page`, data)

/** 出口订单-重置审价 */
export const resetHiPriceOrderExportHiPrice = (id) => request.post(`${url}/resetHiPrice`, { id }, { transferMode: 'path' })

/** 出口订单-审价处理 */
export const reviewHiPriceOrderExportHiPrice = (data) => request.post(`${url}/reviewHiPrice`, data, { transferMode: 'form' })


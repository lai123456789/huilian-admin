
/** 出口订单明细预归类 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderExportDetailDeclar`

/** 出口订单明细预归类-预归类 */
export const updateOrderExportDetailDeclar = (data) => request.post(`${url}/updateDeclar`, data)

/** 出口订单明细预归类-分页查询订单明细预归类信息 */
export const getOrderExportDetailDeclar = (data) => request.get(`${url}/page`, data)

/** 出口订单明细预归类-通过订单明细id查询预归类信息 */
export const getOrderExportDetailDeclarById = (detailId) => request.get(`${url}/get`, { detailId }, { transferMode: 'path' })

/** 出口订单明细预归类-批量归类 */
export const batchDeclareCustomsDeclartOrderExport = (data) => request.post(`${url}/batchDeclare`, data)

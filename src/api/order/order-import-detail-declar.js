
/** 进口订单明细预归类 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderImportDetailDeclar`

/** 进口订单明细预归类-预归类 */
export const updateOrderImportDetailDeclar = (data) => request.post(`${url}/updateDeclar`, data)

/** 进口订单明细预归类-分页查询订单明细预归类信息 */
export const getOrderImportDetailDeclar = (data) => request.get(`${url}/page`, data)

/** 进口订单明细预归类-通过订单明细id查询预归类信息 */
export const getOrderImportDetailDeclarById = (detailId) => request.get(`${url}/get`, { detailId }, { transferMode: 'path' })

/** 进口订单明细预归类-批量归类 */
export const batchDeclareCustomsDeclartOrderImpor = (data) => request.post(`${url}/batchDeclare`, data)


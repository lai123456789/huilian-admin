/** 付款明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctPaymentDetail`

/** 付款明细批量核销 */
export const verifyBatchAcctPaymentDetail = (data) => request.post(`${url}/verifyBatch`, data)

/** 通过ids删除付款明细 */
export const deleteAcctPaymentDetailByIds = (ids) => request.post(`${url}/delete`, { ids }, { transferMode: 'path' })

/** 付款单分页查询 */
export const getAcctPaymentDetail = (data) => request.get(`${url}/page`, data)


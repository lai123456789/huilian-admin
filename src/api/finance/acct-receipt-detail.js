/** 收款明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctReceiptDetail`

/** 通过ids删除收款明细 */
export const deleteAcctReceiptDetailByIds = (ids) => request.post(`${url}/delete`, { ids }, { transferMode: 'path' })

/** 收款明细分页查询 */
export const getAcctReceiptDetail = (data) => request.get(`${url}/page`, data)

/** 收款明细批量核销 */
export const verifyBatchAcctReceiptDetail = (data) => request.post(`${url}/verifyBatch`, data)


/** 进项票明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctReceiveInvoiceDetail`

/** 进项票明细分页查询 */
export const getAcctReceiveInvoiceDetail = (data) => request.get(`${url}/page`, data)

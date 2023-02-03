/** 进项票应收关联记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctReceiveInvoiceRelation`

/** 进项票应收关联记录分页查询 */
export const getAcctReceiveInvoiceRelation = (data) => request.get(`${url}/page`, data)

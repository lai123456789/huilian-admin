/** 销项票关联记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctMakeInvoiceRelation`

/** 销项票关联记录分页查询 */
export const getAcctMakeInvoiceRelation = (data) => request.get(`${url}/page`, data)


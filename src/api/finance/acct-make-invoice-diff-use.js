/** 票差记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctMakeInvoiceDiffUse`

/** 票差记录分页查询 */
export const getAcctMakeInvoiceDiffUse = (data) => request.get(`${url}/page`, data)

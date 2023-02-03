/** 应收类目明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctCostInvoiceDetail`

/** 应收类目明细分页查询 */
export const getAcctCostInvoiceDetail = (data) => request.get(`${url}/page`, data)


/** 销项票明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctMakeInvoiceDetail`

/** 销项票明细-分页查询 */
export const getAcctMakeInvoiceDetail = (data) => request.get(`${url}/page`, data)

/** 修改更新税收分类 */
export const updateAcctMakeInvoiceDetail = (data) => request.post(`${url}/updateTaxCategory`, data)


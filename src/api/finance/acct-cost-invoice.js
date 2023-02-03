/** 应收类目 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctCostInvoice`
export const acctCostInvoiceImportUrl = `${url}/importAcctCostInvoice`
export const acctCostInvoiceExportUrl = `${url}/exportAcctCostInvoice`

/** 新增应收类目 */
export const saveAcctCostInvoice = (data) => request.post(`${url}/save`, data)

/** 通过ids删除应收类目 */
export const deleteAcctCostInvoiceByIds = (ids) => request.post(`${url}/delete`, { ids }, { transferMode: 'path' })

/** 修改应收类目 */
export const updateAcctCostInvoice = (data) => request.post(`${url}/update`, data)

/** 应收类目分页查询 */
export const getAcctCostInvoice = (data) => request.get(`${url}/page`, data)

/** 应收类目通过id查询 */
export const getAcctCostInvoiceById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 应收类目-查询可开票应收类目 */
export const queryForMakeInvoiceAcctCostInvoice = (data) => request.get(`${url}/queryForMakeInvoice`, data)

/** 应收类目-结算账期 */
export const settleAdvanceacctCostInvoice = (data) => request.post(`${url}/settleAdvance`, data)

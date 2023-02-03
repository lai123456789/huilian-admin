/** 票差记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctMakeInvoiceDiff`

/** 通过id删除票差记录 */
export const deleteAcctMakeInvoiceDiffById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 票差记录分页查询 */
export const getAcctMakeInvoiceDiff = (data) => request.get(`${url}/page`, data)

/** 票差记录-查询可关联票差记录 */
export const queryForMakeInvoiceDiff = (data) => request.get(`${url}/queryForMakeInvoiceDiff`, data)

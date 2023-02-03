/** 企业开票资料 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyInvoice`

/** 新增企业开票资料 */
export const saveCompanyInvoice = (data) => request.post(`${url}/save`, data)

/** 通过id删除企业开票资料 */
export const deleteCompanyInvoiceById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改企业开票资料 */
export const updateCompanyInvoice = (data) => request.post(`${url}/update`, data)

/** 企业开票资料分页查询 */
export const getCompanyInvoice = (data) => request.get(`${url}/page`, data)

/** 企业开票资料通过id查询 */
export const getCompanyInvoiceById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

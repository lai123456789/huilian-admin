/** 供应商 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companySupplier`

/** 新增供应商 */
export const saveCompanySupplier = (data) => request.post(`${url}/save`, data)

/** 通过id删除供应商 */
export const deleteCompanySupplierById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改供应商 */
export const updateCompanySupplier = (data) => request.post(`${url}/update`, data)

/** 供应商分页查询 */
export const getCompanySupplier = (data) => request.get(`${url}/page`, data)

/** 供应商通过id查询 */
export const getCompanySupplierById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 供应商-通过企业名称查询 */
export const getCompanySupplierDetailsByCompanyName = (companyName) => request.get(`${url}/details`, { companyName }, { transferMode: 'path' })

/** 根据企业ID，查询是否为供应商 */
export const isExistsCompanySupplierByCompanyId = (companyId) => request.get(`${url}/isExists`, { companyId }, { transferMode: 'path' })

/** 供应商-银行EAS编码录入 */
export const updateEasNoCompanySupplier = (data) => request.post(`${url}/updateEasNo`, data, { transferMode: 'form' })

/** 客户 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCustomer`

/** 新增客户 */
export const saveCompanyCustomer = (data) => request.post(`${url}/save`, data)

/** 通过id删除客户 */
export const deleteCompanyCustomerById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改客户 */
export const updateCompanyCustomer = (data) => request.post(`${url}/update`, data)

/** 客户分页查询 */
export const getCompanyCustomer = (data) => request.get(`${url}/page`, data)

/** 客户通过id查询 */
export const getCompanyCustomerById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 客户-通过企业名称查询 */
export const getCompanyCustomerDetailsByCompanyName = (companyName) => request.get(`${url}/details`, { companyName }, { transferMode: 'path' })

/** 根据企业ID，查询是否为客户 */
export const isExistsCompanyCustomerByCompanyId = (companyId) => request.get(`${url}/isExists`, { companyId }, { transferMode: 'path' })

/** 客户-银行EAS编码录入 */
export const updateEasNoCompanyCustomer = (data) => request.post(`${url}/updateEasNo`, data, { transferMode: 'form' })

/** 销售客户 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusCustomer`

/** 新增销售客户 */
export const saveCompanyCusCustomer = (data) => request.post(`${url}/save`, data)

/** 通过id删除销售客户 */
export const deleteCompanyCusCustomerById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改销售客户 */
export const updateCompanyCusCustomer = (data) => request.post(`${url}/update`, data)

/** 销售客户分页查询 */
export const getCompanyCusCustomer = (data) => request.get(`${url}/page`, data)

/** 销售客户通过id查询 */
export const getCompanyCusCustomerById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

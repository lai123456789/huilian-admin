/** 客户服务协议模板 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusContractTemplate`

/** 新增客户服务协议模板 */
export const saveCompanyCusContractTemplate = (data) => request.post(`${url}/save`, data)

/** 通过id删除客户服务协议模板 */
export const deleteCompanyCusContractTemplateById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改客户服务协议模板 */
export const updateCompanyCusContractTemplate = (data) => request.post(`${url}/update`, data)

/** 客户服务协议模板分页查询 */
export const getCompanyCusContractTemplate = (data) => request.get(`${url}/page`, data)

/** 客户服务协议模板通过id查询 */
export const getCompanyCusContractTemplateById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 承运商 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyTransport`

/** 新增承运商 */
export const saveCompanyTransport = (data) => request.post(`${url}/save`, data)

/** 通过id删除承运商 */
export const deleteCompanyTransportById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改承运商 */
export const updateCompanyTransport = (data) => request.post(`${url}/update`, data)

/** 承运商分页查询 */
export const getCompanyTransport = (data) => request.get(`${url}/page`, data)

/** 承运商通过id查询 */
export const getCompanyTransportById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 承运商-通过企业名称查询 */
export const getCompanyTransportDetailsByCompanyName = (companyName) => request.get(`${url}/details`, { companyName }, { transferMode: 'path' })

/** 根据企业ID，查询是否为承运商 */
export const isExistsCompanyTransportByCompanyId = (companyId) => request.get(`${url}/isExists`, { companyId }, { transferMode: 'path' })


/** 报关行 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCustoms`

/** 新增报关行 */
export const saveCompanyCustoms = (data) => request.post(`${url}/save`, data)

/** 通过id删除报关行 */
export const deleteCompanyCustomsById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改报关行 */
export const updateCompanyCustoms = (data) => request.post(`${url}/update`, data)

/** 报关行分页查询 */
export const getCompanyCustoms = (data) => request.get(`${url}/page`, data)

/** 报关行通过id查询 */
export const getCompanyCustomsById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 报关行-通过企业名称查询 */
export const getCompanyCustomsDetailsByCompanyName = (companyName) => request.get(`${url}/details`, { companyName }, { transferMode: 'path' })

/** 根据企业ID，查询是否为报关行 */
export const isExistsCompanyCustomsByCompanyId = (companyId) => request.get(`${url}/isExists`, { companyId }, { transferMode: 'path' })


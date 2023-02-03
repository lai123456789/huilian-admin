/** 主体公司 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyPrincipal`

/** 新增主体公司 */
export const saveCompanyPrincipal = (data) => request.post(`${url}/save`, data)

/** 通过id删除主体公司 */
export const deleteCompanyPrincipalById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改主体公司 */
export const updateCompanyPrincipal = (data) => request.post(`${url}/update`, data)

/** 主体公司分页查询 */
export const getCompanyPrincipal = (data) => request.get(`${url}/page`, data)

/** 主体公司通过id查询 */
export const getCompanyPrincipalById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 主体公司-通过企业名称查询 */
export const getCompanyPrincipalDetailsByCompanyName = (companyName) => request.get(`${url}/details`, { companyName }, { transferMode: 'path' })

/** 根据企业ID，查询是否为主体公司 */
export const isExistsCompanyPrincipalByCompanyId = (companyId) => request.get(`${url}/isExists`, { companyId }, { transferMode: 'path' })


/** 资金方 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyFunders`

/** 新增资金方 */
export const saveCompanyFunders = (data) => request.post(`${url}/save`, data)

/** 通过id删除资金方 */
export const deleteCompanyFundersById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改资金方 */
export const updateCompanyFunders = (data) => request.post(`${url}/update`, data)

/** 资金方分页查询 */
export const getCompanyFunders = (data) => request.get(`${url}/page`, data)

/** 资金方通过id查询 */
export const getCompanyFundersById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 资金方-通过企业名称查询 */
export const getCompanyFundersDetailsByCompanyName = (companyName) => request.get(`${url}/details`, { companyName }, { transferMode: 'path' })

/** 根据企业ID，查询是否为资金方 */
export const isExistsCompanyFundersByCompanyId = (companyId) => request.get(`${url}/isExists`, { companyId }, { transferMode: 'path' })


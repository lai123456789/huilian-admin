/** 企业联系人 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyPerson`

/** 新增企业联系人 */
export const saveCompanyPerson = (data) => request.post(`${url}/save`, data)

/** 通过id删除企业联系人 */
export const deleteCompanyPersonById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改企业联系人 */
export const updateCompanyPerson = (data) => request.post(`${url}/update`, data)

/** 企业联系人分页查询 */
export const getCompanyPerson = (data) => request.get(`${url}/page`, data)

/** 企业联系人通过id查询 */
export const getCompanyPersonById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

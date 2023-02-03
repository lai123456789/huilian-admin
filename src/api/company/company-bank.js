/** 银行资料 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyBank`

/** 新增银行资料 */
export const saveCompanyBank = (data) => request.post(`${url}/save`, data)

/** 通过id删除银行资料 */
export const deleteCompanyBankById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改银行资料 */
export const updateCompanyBank = (data) => request.post(`${url}/update`, data)

/** 银行资料分页查询 */
export const getCompanyBank = (data) => request.get(`${url}/page`, data)

/** 银行资料通过id查询 */
export const getCompanyBankById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

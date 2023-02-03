/** 企业信息 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyInfo`

/** 企业信息分页查询 */
export const getCompanyInfo = (data) => request.get(`${url}/page`, data)

/** 企业信息通过id查询 */
export const getCompanyInfoById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

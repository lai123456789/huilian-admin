/** 客户额度总量 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/riskCusQuota`

/** 客户额度总量分页查询 */
export const getRiskCusQuota = (data) => request.get(`${url}/page`, data)

/** 客户额度总量通过id查询 */
export const getRiskCusQuotaById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

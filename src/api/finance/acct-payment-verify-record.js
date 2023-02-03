/** 付款核销记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctPaymentVerifyRecord`

/** 付款核销记录分页查询 */
export const getAcctPaymentVerifyRecord = (data) => request.get(`${url}/page`, data)

/** 收款核销记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctReceiptVerifyRecord`

/** 收款核销记录分页查询 */
export const getAcctReceiptVerifyRecord = (data) => request.get(`${url}/page`, data)

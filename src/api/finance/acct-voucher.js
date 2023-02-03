/** 凭证 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctVoucher`

/** 新增凭证 */
export const saveAcctVoucher = (data) => request.post(`${url}/save`, data)

/** 通过id删除凭证 */
export const deleteAcctVoucherById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 凭证-查看凭证 */
export const previewVoucherAcctVoucher = (data) => request.get(`${url}/view`, data)

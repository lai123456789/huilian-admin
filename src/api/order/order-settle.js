/** 订单结算 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderSettle`

/** 订单结算-整单结算 */
export const settleOrderSettle = data => request.post(`${url}/settle`, data, { transferMode: 'form' })

/** 订单结算-结算货款 */
export const settleCargoOrderSettle = data => request.post(`${url}/settleCargo`, data, { transferMode: 'form' })

/** 订单结算-结算税代费(结算服务费) */
export const settleProxyOrderSettle = data => request.post(`${url}/settleProxy`, data, { transferMode: 'form' })

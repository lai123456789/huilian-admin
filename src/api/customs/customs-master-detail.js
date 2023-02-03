/** 报关单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsMasterDetail`

/** 报关单明细分页查询 */
export const getCustomsMasterDetail = (data) => request.get(`${url}/page`, data)

/** 报关单明细-归类 */
export const updateDeclarCustomsMasterDetail = (data) => request.post(`${url}/updateDeclar`, data)

/** 报关单明细-合并 */
export const mergerDetailCustomsMasterDetail = (data) => request.post(`${url}/mergerDetail`, data, { transferMode: 'form' })

/** 报关运输单集装箱 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsTransportContainer`

/** 报关运输单集装箱-分页查询 */
export const getCustomsTransportContainer = (data) => request.get(`${url}/page`, data)


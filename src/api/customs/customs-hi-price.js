/** 商品申报价格历史 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsHiPrice`

/** 商品申报价格历史分页查询 */
export const getCustomsHiPrice = (data) => request.get(`${url}/page`, data)


/** 库存匹配记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareStockMatch`

/** 库存匹配记录分页查询 */
export const getWareStockMatch = (data) => request.get(`${url}/page`, data)

/** 库存匹配记录通过id查询 */
export const getWareStockMatchById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


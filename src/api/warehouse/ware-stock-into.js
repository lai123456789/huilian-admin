/** 库存记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareStockInto`

/** 库存记录分页查询 */
export const getWareStockInto = (data) => request.get(`${url}/page`, data)


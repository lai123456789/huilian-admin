/** 出库单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareShippingDetail`

/** 通过id删除出库单明细 */
export const deleteWareShippingDetailById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改出库单明细 */
export const updateWareShippingDetail = (data) => request.post(`${url}/update`, data)

/** 出库单明细分页查询 */
export const getWareShippingDetail = (data) => request.get(`${url}/page`, data)

/** 出库单明细通过id查询 */
export const getWareShippingDetailById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


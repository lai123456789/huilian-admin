/** 出库单验货明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareShippingCheckDetail`

/** 修改出库单验货明细 */
export const updateWareShippingCheckDetail = (data) => request.post(`${url}/update`, data)

/** 出库单验货明细分页查询 */
export const getWareShippingCheckDetail = (data) => request.get(`${url}/page`, data)

/** 出库单验货明细通过id查询 */
export const getWareShippingCheckDetailById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 出库单验货明细-批量修改 */
export const updateBatchWareShippingCheckDetail = (data) => request.post(`${url}/updateBatch`, data)

/** 出库单验货明细-排序 */
export const sortWareShippingCheckDetail = (data) => request.post(`${url}/sort`, data, { transferMode: 'form' })

/** 出库单验货明细-拆分 */
export const splitWareShippingCheckDetail = (data) => request.post(`${url}/splitByDetail`, data)

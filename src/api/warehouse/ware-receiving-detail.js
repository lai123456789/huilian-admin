/** 入库单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareReceivingDetail`

/** 通过id删除入库单明细 */
export const deleteWareReceivingDetailById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改入库单明细 */
export const updateWareReceivingDetail = (data) => request.post(`${url}/update`, data)

/** 入库单明细分页查询 */
export const getWareReceivingDetail = (data) => request.get(`${url}/page`, data)

/** 入库单明细通过id查询 */
export const getWareReceivingDetailById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 拆分入库单明细 */
export const splitWareReceivingDetail = (data) => request.post(`${url}/split`, data)

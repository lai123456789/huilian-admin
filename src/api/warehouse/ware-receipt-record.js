/** 收货记录 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareReceiptRecord`

/** 新增收货记录 */
export const saveWareReceiptRecord = (data) => request.post(`${url}/save`, data)

/** 通过id删除收货记录 */
export const deleteWareReceiptRecordById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改收货记录 */
export const updateWareReceiptRecord = (data) => request.post(`${url}/update`, data)

/** 收货记录分页查询 */
export const getWareReceiptRecord = (data) => request.get(`${url}/page`, data)

/** 收货记录通过id查询 */
export const getWareReceiptRecordById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


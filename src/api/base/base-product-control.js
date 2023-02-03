/** 商品管制情况 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseProductControl`

/** 新增商品管制情况 */
export const saveBaseProductControl = (data) => request.post(`${url}/save`, data)

/** 通过id删除商品管制情况 */
export const deleteBaseProductControlById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改商品管制情况 */
export const updateBaseProductControl = (data) => request.post(`${url}/update`, data)

/** 商品管制情况分页查询 */
export const getBaseProductControl = (data) => request.get(`${url}/page`, data)

/** 商品管制情况通过id查询 */
export const getBaseProductControlById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 同步香港商品管制情况 */
export const syncHkBaseProductControl = (data) => request.post(`${url}/syncHkProductControl`, data, { transferMode: 'form' })

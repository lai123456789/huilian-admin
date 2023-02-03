/** 商品单位 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/productUnit`

/** 新增商品单位 */
export const saveProductUnit = (data) => request.post(`${url}/save`, data)

/** 通过id删除商品单位 */
export const deleteProductUnitById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改商品单位 */
export const updateProductUnit = (data) => request.post(`${url}/update`, data)

/** 商品单位分页查询 */
export const getProductUnit = (data) => request.get(`${url}/page`, data)

/** 商品单位通过id查询 */
export const getProductUnitById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


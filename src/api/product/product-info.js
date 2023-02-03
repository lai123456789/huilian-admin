/** 商品 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/productInfo`
export const productInfoImportUrl = `${url}/importProductInfo`
export const productInfoExportUrl = `${url}/exportProductInfo`

/** 新增商品 */
export const saveProductInfo = (data) => request.post(`${url}/save`, data)

/** 通过id删除商品 */
export const deleteProductInfoById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改商品 */
export const updateProductInfo = (data) => request.post(`${url}/update`, data)

/** 商品分页查询 */
export const getProductInfo = (data) => request.get(`${url}/page`, data)

/** 商品通过id查询 */
export const getProductInfoById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


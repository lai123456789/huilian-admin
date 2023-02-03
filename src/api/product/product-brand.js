/** 商品品牌 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/productBrand`

/** 新增商品品牌 */
export const saveProductBrand = (data) => request.post(`${url}/save`, data)

/** 通过id删除商品品牌 */
export const deleteProductBrandById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改商品品牌 */
export const updateProductBrand = (data) => request.post(`${url}/update`, data)

/** 商品品牌分页查询 */
export const getProductBrand = (data) => request.get(`${url}/page`, data)

/** 商品品牌通过id查询 */
export const getProductBrandById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 商品品牌-根据品牌名称查询（不区分中英文） */
export const getProductBrandByBrandName = (data) => request.get(`${url}/getByBrandName`, data)

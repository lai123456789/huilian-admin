/** 商品类别 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/productType`

/** 新增商品类别 */
export const saveProductType = (data) => request.post(`${url}/save`, data)

/** 通过id删除商品类别 */
export const deleteProductTypeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改商品类别 */
export const updateProductType = (data) => request.post(`${url}/update`, data)

/** 商品类别分页查询 */
export const getProductType = (data) => request.get(`${url}/page`, data)

/** 商品类别通过id查询 */
export const getProductTypeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 获取商品类别左侧树形数据 */
export const productTypeTree = (data) => request.get(`${url}/tree`, data)

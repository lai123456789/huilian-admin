/** 税收分类 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseTaxCategory`

/** 新增税收分类 */
export const saveBaseTaxCategory = (data) => request.post(`${url}/save`, data)

/** 通过id删除税收分类 */
export const deleteBaseTaxCategoryById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改税收分类 */
export const updateBaseTaxCategory = (data) => request.post(`${url}/update`, data)

/** 税收分类分页查询 */
export const getBaseTaxCategory = (data) => request.get(`${url}/page`, data)

/** 税收分类通过id查询 */
export const getBaseTaxCategoryById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

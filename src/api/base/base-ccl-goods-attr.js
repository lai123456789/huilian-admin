/** 货物属性代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclGoodsAttr`

/** 新增货物属性代码 */
export const saveBaseCclGoodsAttr = (data) => request.post(`${url}/save`, data)

/** 通过id删除货物属性代码 */
export const deleteBaseCclGoodsAttrById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改货物属性代码 */
export const updateBaseCclGoodsAttr = (data) => request.post(`${url}/update`, data)

/** 货物属性代码分页查询 */
export const getBaseCclGoodsAttr = (data) => request.get(`${url}/page`, data)

/** 货物属性代码通过id查询 */
export const getBaseCclGoodsAttrById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


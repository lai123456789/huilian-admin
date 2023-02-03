/** 费用类目 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCostItem`

/** 新增费用类目 */
export const saveBaseCostItem = (data) => request.post(`${url}/save`, data)

/** 通过id删除费用类目 */
export const deleteBaseCostItemById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改费用类目 */
export const updateBaseCostItem = (data) => request.post(`${url}/update`, data)

/** 费用类目分页查询 */
export const getBaseCostItem = (data) => request.get(`${url}/page`, data)

/** 费用类目通过id查询 */
export const getBaseCostItemById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


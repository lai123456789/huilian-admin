/** 出入境口岸代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclEntyPortCode`

/** 新增出入境口岸代码 */
export const saveBaseCclEntyPortCode = (data) => request.post(`${url}/save`, data)

/** 通过id删除出入境口岸代码 */
export const deleteBaseCclEntyPortCodeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改出入境口岸代码 */
export const updateBaseCclEntyPortCode = (data) => request.post(`${url}/update`, data)

/** 出入境口岸代码分页查询 */
export const getBaseCclEntyPortCode = (data) => request.get(`${url}/page`, data)

/** 出入境口岸代码通过id查询 */
export const getBaseCclEntyPortCodeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


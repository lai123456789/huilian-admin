/** 仓库 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseWareHouse`

/** 新增仓库 */
export const saveBaseWareHouse = (data) => request.post(`${url}/save`, data)

/** 通过id删除仓库 */
export const deleteBaseWareHouseById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改仓库 */
export const updateBaseWareHouse = (data) => request.post(`${url}/update`, data)

/** 仓库分页查询 */
export const getBaseWareHouse = (data) => request.get(`${url}/page`, data)

/** 仓库通过id查询 */
export const getBaseWareHouseById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


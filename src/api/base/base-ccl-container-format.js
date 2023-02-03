/** 集装箱规格代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclContainerFormat`

/** 新增集装箱规格代码 */
export const saveBaseCclContainerFormat = (data) => request.post(`${url}/save`, data)

/** 通过id删除集装箱规格代码 */
export const deleteBaseCclContainerFormatById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改集装箱规格代码 */
export const updateBaseCclContainerFormat = (data) => request.post(`${url}/update`, data)

/** 集装箱规格代码分页查询 */
export const getBaseCclContainerFormat = (data) => request.get(`${url}/page`, data)

/** 集装箱规格代码通过id查询 */
export const getBaseCclContainerFormatById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


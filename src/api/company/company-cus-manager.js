/** 客户维护人信息 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusManager`

/** 新增客户维护人信息 */
export const saveCompanyCusManager = (data) => request.post(`${url}/save`, data)

/** 通过id删除客户维护人信息 */
export const deleteCompanyCusManagerById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改客户维护人信息 */
export const updateCompanyCusManager = (data) => request.post(`${url}/update`, data)

/** 客户维护人信息分页查询 */
export const getCompanyCusManager = (data) => request.get(`${url}/page`, data)

/** 客户维护人信息通过id查询 */
export const getCompanyCusManagerById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

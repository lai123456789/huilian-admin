/** 客户交货信息 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyCusDelivery`

/** 新增客户交货信息 */
export const saveCompanyCusDelivery = (data) => request.post(`${url}/save`, data)

/** 通过id删除客户交货信息 */
export const deleteCompanyCusDeliveryById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改客户交货信息 */
export const updateCompanyCusDelivery = (data) => request.post(`${url}/update`, data)

/** 客户交货信息分页查询 */
export const getCompanyCusDelivery = (data) => request.get(`${url}/page`, data)

/** 客户交货信息通过id查询 */
export const getCompanyCusDeliveryById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 供应商交货信息 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companySupDelivery`

/** 新增供应商交货信息 */
export const saveCompanySupDelivery = (data) => request.post(`${url}/save`, data)

/** 通过id删除供应商交货信息 */
export const deleteCompanySupDeliveryById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改供应商交货信息 */
export const updateCompanySupDelivery = (data) => request.post(`${url}/update`, data)

/** 供应商交货信息分页查询 */
export const getCompanySupDelivery = (data) => request.get(`${url}/page`, data)

/** 供应商交货信息通过id查询 */
export const getCompanySupDeliveryById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

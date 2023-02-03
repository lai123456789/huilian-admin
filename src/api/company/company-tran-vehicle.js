/** 承运商车辆 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyTranVehicle`

/** 新增承运商车辆 */
export const saveCompanyTranVehicle = (data) => request.post(`${url}/save`, data)

/** 通过id删除承运商车辆 */
export const deleteCompanyTranVehicleById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改承运商车辆 */
export const updateCompanyTranVehicle = (data) => request.post(`${url}/update`, data)

/** 承运商车辆分页查询 */
export const getCompanyTranVehicle = (data) => request.get(`${url}/page`, data)

/** 承运商车辆通过id查询 */
export const getCompanyTranVehicleById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

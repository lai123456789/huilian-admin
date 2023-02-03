/** 承运商司机 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companyTranDriver`

/** 新增承运商司机 */
export const saveCompanyTranDriver = (data) => request.post(`${url}/save`, data)

/** 通过id删除承运商司机 */
export const deleteCompanyTranDriverById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改承运商司机 */
export const updateCompanyTranDriver = (data) => request.post(`${url}/update`, data)

/** 承运商司机分页查询 */
export const getCompanyTranDriver = (data) => request.get(`${url}/page`, data)

/** 承运商司机通过id查询 */
export const getCompanyTranDriverById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

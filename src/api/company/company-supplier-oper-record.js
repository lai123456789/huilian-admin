/** 供应商操作日志 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/companySupplierOperRecord`

/** 新增供应商操作日志 */
export const saveCompanySupplierOperRecord = (data) => request.post(`${url}/save`, data)

/** 供应商操作日志分页查询 */
export const getCompanySupplierOperRecord = (data) => request.get(`${url}/page`, data)


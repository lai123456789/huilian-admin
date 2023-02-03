/** 应付类目 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctCostPay`
export const acctCostPayImportUrl = `${url}/importAcctCostPay`
export const acctCostPayExportUrl = `${url}/exportAcctCostPay`

/** 新增应付类目 */
export const saveAcctCostPay = (data) => request.post(`${url}/save`, data)

/** 通过ids删除应付类目 */
export const deleteAcctCostPayByIds = (ids) => request.post(`${url}/delete`, { ids }, { transferMode: 'path' })

/** 修改应付类目 */
export const updateAcctCostPay = (data) => request.post(`${url}/update`, data)

/** 应付类目分页查询 */
export const getAcctCostPay = (data) => request.get(`${url}/page`, data)

/** 应付类目通过id查询 */
export const getAcctCostPayById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


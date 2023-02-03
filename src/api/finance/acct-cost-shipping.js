/** 出库费用 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/acctCostShipping`

/** 新增出库费用 */
export const saveAcctCostShipping = (data) => request.post(`${url}/save`, data)

/** 通过ids删除出库费用 */
export const deleteAcctCostShippingByIds = (ids) => request.post(`${url}/deletes`, { ids }, { transferMode: 'path' })

/** 修改出库费用 */
export const updateAcctCostShipping = (data) => request.post(`${url}/update`, data)

/** 出库费用分页查询 */
export const getAcctCostShipping = (data) => request.get(`${url}/page`, data)

/** 出库费用通过id查询 */
export const getAcctCostShippingById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


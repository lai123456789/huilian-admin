/** 基差合同 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderBasisContract`

/** 新增基差合同 */
export const saveOrderBasisContract = (data) => request.post(`${url}/save`, data)

/** 通过id删除基差合同 */
export const deleteOrderBasisContractById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改基差合同 */
export const updateOrderBasisContract = (data) => request.post(`${url}/update`, data)

/** 基差合同分页查询 */
export const getOrderBasisContract = (data) => request.get(`${url}/page`, data)

/** 基差合同通过id查询 */
export const getOrderBasisContractById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 基差合同查询审批记录 */
export const getOrderBasisContractAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核基差合同 */
export const auditOrderBasisContract = (data) => request.post(`${url}/audit`, data)

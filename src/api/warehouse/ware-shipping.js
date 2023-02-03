/** 出库单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/wareShipping`

/** 新增出库单 */
export const saveWareShipping = (data) => request.post(`${url}/save`, data)

/** 通过id删除出库单 */
export const deleteWareShippingById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改出库单 */
export const updateWareShipping = (data) => request.post(`${url}/update`, data)

/** 出库单分页查询 */
export const getWareShipping = (data) => request.get(`${url}/page`, data)

/** 出库单通过id查询 */
export const getWareShippingById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 出库单查询审批记录 */
export const getWareShippingAuditList = (id) => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核出库单 */
export const auditWareShipping = (data) => request.post(`${url}/audit`, data)

/** 备货 */
export const choiceWareShippingById = (id) => request.post(`${url}/choice`, { id }, { transferMode: 'path' })

/** 取消备货 */
export const choiceRollBackWareShippingById = (id) => request.post(`${url}/choiceRollBack`, { id }, { transferMode: 'path' })

/** 签收 */
export const checkSignWareShippingById = (id) => request.post(`${url}/checkSign`, { id }, { transferMode: 'path' })

/** 签收撤回 */
export const checkRollBackWareShippingById = (id) => request.post(`${url}/checkRollBack`, { id }, { transferMode: 'path' })

/** 验货完成 */
export const inspectionWareShippingById = (id) => request.post(`${url}/inspection`, { id }, { transferMode: 'path' })

/** 验货撤回 */
export const inspectionRollBackWareShippingById = (id) => request.post(`${url}/inspectionRollBack`, { id }, { transferMode: 'path' })

/** 出库 */
export const checkoutWareShippingById = (id) => request.post(`${url}/checkout`, { id }, { transferMode: 'path' })

/** 出库撤回 */
export const checkoutRollBackWareShippingById = (id) => request.post(`${url}/checkoutRollBack`, { id }, { transferMode: 'path' })

/** 查询可做物流单的出库单 */
export const getWareShippingOrder = (data) => request.post(`${url}/getWareShippingOrder`, data, { transferMode: 'form' })

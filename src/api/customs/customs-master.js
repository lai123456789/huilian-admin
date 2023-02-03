/** 报关单 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsMaster`

/** 通过id删除报关单 */
export const deleteCustomsMasterById = id => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改报关单 */
export const updateCustomsMaster = data => request.post(`${url}/update`, data)

/** 报关单分页查询 */
export const getCustomsMaster = data => request.get(`${url}/page`, data)

/** 报关单通过id查询 */
export const getCustomsMasterById = id => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 报关单查询审批记录 */
export const getCustomsMasterAuditList = id => request.get(`${url}/auditList`, { id }, { transferMode: 'path' })

/** 审核报关单 */
export const auditCustomsMaster = data => request.post(`${url}/audit`, data)

/** 根据订单id生成报关单 */
export const generateCustomsMasterByOrderId = data => request.post(`${url}/generateCustomsMaster`, data, { transferMode: 'form' })

/** 通过合同协议号查询 */
export const getCustomsMasterByContrNo = contrNo => request.get(`${url}/getByContrNo`, { contrNo }, { transferMode: 'path' })

/** 提交货物申报 */
export const goodsDeclareCustomsMaster = data => request.post(`${url}/goodsDeclare`, data)

/** 撤销货物申报 */
export const goodsDeclareRollbackCustomsMaster = data => request.post(`${url}/goodsDeclareRollback`, data, { transferMode: 'form' })

/** 提交舱单变更 */
export const manifestChangeCustomsMaster = data => request.post(`${url}/manifestChange`, data)

/** 提交舱单申报 */
export const manifestDeclareCustomsMaster = data => request.post(`${url}/manifestDeclare`, data, { transferMode: 'form' })

/** 提交舱单删除 */
export const manifestDeleteCustomsMaster = data => request.post(`${url}/manifestDelete`, data)

/** 拼单分页查询 */
export const getMergeCustomsPageCustomsMaster = data => request.get(`${url}/mergeCustomsPage`, data)

/** 拼单 */
export const mergeCustomsMasterCustomsMaster = data => request.post(`${url}/mergeCustomsMaster`, data, { transferMode: 'form' })

/** 订单分页查询 */
export const getOrderPageCustomsMaster = data => request.get(`${url}/orderPage`, data)

/** 按报关单明细拆单 */
export const splitCustomsMasterByDetailIds = data => request.post(`${url}/splitByDetailIds`, data, { transferMode: 'form' })

/** 按订单拆单 */
export const splitCustomsMasterByOrderIds = data => request.post(`${url}/splitByOrderIds`, data, { transferMode: 'form' })

/** 报关信息补录 */
export const updateEntryIdCustomsMaster = data => request.post(`${url}/updateEntryId`, data, { transferMode: 'form' })

/** 上传税单 */
export const uploadTaxFormCustomsMaster = data => request.post(`${url}/uploadTaxForm`, data, { transferMode: 'form' })

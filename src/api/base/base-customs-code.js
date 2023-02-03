/** 海关编码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCustomsCode`
/** 导出海关编码CIQ模板 */
export const exportCiqTemplateUrl = `${url}/exportCiqTemplate`
/** 导出海关编码模板 */
export const exportTemplateUrl = `${url}/exportTemplate`
/** 导入海关编码CIQ信息 */
export const importCiqExcelUrl = `${url}/importCiqExcel`
/** 导入海关编码信息 */
export const importExcelUrl = `${url}/importExcel`
/** 导入Excel修改海关编码 */
export const updateByExcelUrl = `${url}/updateByExcel`

/** 新增海关编码 */
export const saveBaseCustomsCode = (data) => request.post(`${url}/save`, data)

/** 通过id删除海关编码 */
export const deleteBaseCustomsCodeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改海关编码 */
export const updateBaseCustomsCode = (data) => request.post(`${url}/update`, data)

/** 海关编码分页查询 */
export const getBaseCustomsCode = (data) => request.get(`${url}/page`, data)

/** 海关编码通过id查询 */
export const getBaseCustomsCodeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 海关编码-分页查询CIQ信息 */
export const getCustomsCiqCodePageBaseCustomsCode = (data) => request.get(`${url}/customsCiqCodePage`, data)

/** 海关编码-通过商品编码查询 */
export const getProductCodeBaseCustomsCode = (data) => request.get(`${url}/getProductCode`, data)

/** 同步海关编码 */
export const syncBaseCustomsCode = (hsCode) => request.post(`${url}/syncCustomsCode`, { hsCode }, { transferMode: 'path' })

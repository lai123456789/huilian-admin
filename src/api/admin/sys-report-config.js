/** 报表配置 */
import { request } from '@/api'

const url = `/admin/sysReportConfig`

/** 新增报表配置 */
export const saveSysReportConfig = (data) => request.post(`${url}/save`, data)

/** 通过id删除报表配置 */
export const deleteSysReportConfigById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改报表配置 */
export const updateSysReportConfig = (data) => request.post(`${url}/update`, data)

/** 报表配置分页查询 */
export const getSysReportConfig = (data) => request.get(`${url}/page`, data)

/** 报表配置通过id查询 */
export const getSysReportConfigById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 根据菜单标识查询报表配置 */
export const getSysReportByMenuMarkSysReportConfig = (data) => request.get(`${url}/getSysReportByMenuMark`, data)

/** 合并导出Excel */
export const mergeReportExcelSysReportConfig = (data) => request.post(`${url}/mergeReportExcel`, data, { transferMode: 'form', responseType: 'blob' })

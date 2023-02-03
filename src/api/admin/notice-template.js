/** 通知模板 */
import { request } from '@/api'
const url = `/admin/sysNoticeTemplate`

/** 新增通知模板 */
export const saveSysNoticeTemplate = data => request.post(`${url}/save`, data)

/** 通过id删除通知模板 */
export const deleteSysNoticeTemplateById = id => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改通知模板 */
export const updateSysNoticeTemplate = data => request.post(`${url}/update`, data)

/** 通知模板分页查询 */
export const getSysNoticeTemplate = data => request.get(`${url}/page`, data)

/** 通知模板通过id查询 */
export const getSysNoticeTemplateById = id => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 系统公告 */
import { request } from '@/api'

const url = `/admin/sysNotice`

/** 新增系统公告 */
export const saveSysNotice = (data) => request.post(`${url}/save`, data)

/** 通过id删除系统公告 */
export const deleteSysNoticeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改系统公告 */
export const updateSysNotice = (data) => request.post(`${url}/update`, data)

/** 系统公告分页查询 */
export const getSysNotice = (data) => request.get(`${url}/page`, data)

/** 系统公告通过id查询 */
export const getSysNoticeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

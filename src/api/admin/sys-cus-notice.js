/** 在线公告 */
import { request } from '@/api'

const url = `/admin/sysCusNotice`

/** 新增在线公告 */
export const saveSysCusNotice = (data) => request.post(`${url}/save`, data)

/** 通过id删除在线公告 */
export const deleteSysCusNoticeById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改在线公告 */
export const updateSysCusNotice = (data) => request.post(`${url}/update`, data)

/** 在线公告分页查询 */
export const getSysCusNotice = (data) => request.get(`${url}/page`, data)

/** 在线公告通过id查询 */
export const getSysCusNoticeById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

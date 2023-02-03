/** 定时任务 */
import { request } from '@/api'

const url = `/job/sys-job`

/** 新增定时任务 */
export const saveSysJob = (data) => request.post(url, data)

/** 通过id删除定时任务 */
export const deleteJobById = (id) => request.delete(url, { id }, { transferMode: 'path' })

/** 修改定时任务 */
export const updateSysJob = (data) => request.put(url, data)

/** 系统编码分页查询 */
export const getSysJob = (data) => request.get(`${url}/page`, data)

/** 定时任务通过id查询 */
export const getSysJobById = (id) => request.get(url, { id }, { transferMode: 'path' })

/** 定时任务暂停全部任务 */
export const shutdownSysJob = (data) => request.post(`${url}/shutdown-jobs`, data)

/** 定时任务暂停单个任务 */
export const shutdownSysJobSingle = (id) => request.post(`${url}/shutdown-jobs`, { id }, { transferMode: 'path' })

/** 定时任务启动全部任务 */
export const startSysJob = (data) => request.post(`${url}/start-jobs`, data)

/** 定时任务启动单个任务 */
export const startSysJobSingle = (id) => request.post(`${url}/start-jobs`, { id }, { transferMode: 'path' })

/** 定时任务重置全部任务 */
export const refreshSysJob = (data) => request.post(`${url}/refresh-jobs`, data)

/** 定时任务执行 */
export const runSysJob = (id) => request.post(`${url}/run-job`, { id }, { transferMode: 'path' })


/** 定时任务日志 */
import { request } from '@/api'

const url = `/job/sys-job-log`

/** 系统编码分页查询 */
export const getSysJobLog = (data) => request.get(`${url}/page`, data)


/** 流程管理 */
import { request } from '@/api'

const url = `/act/process`

/** 通过id删除流程 */
export const deleteProcessById = (id) => request.delete(url, id)

/** 流程分页查询 */
export const getProcess = (data) => request.get(url, data)

/** 根据流程实例id，修改流程状态 */
export const updateProcessStatusByProInsIdAndStatus = (proInsId, status) => request.put(`${url}/status`, { proInsId, status }, { transferMode: 'path' })

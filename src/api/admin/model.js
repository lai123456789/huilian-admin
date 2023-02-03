/** 模型管理 */
import { request } from '@/api'

const url = `/act/model`

/** 新增模型 */
export const insertModel = data => request.post(`${url}/insert`, data)

/** 通过id删除模型 */
export const deleteModelById = clientId => request.delete(url, { clientId }, { transferMode: 'path' })

/** 模型分页查询 */
export const getModel = data => request.get(url, data)

/** 部署模型 */
export const deployModel = id => request.post(`${url}/deploy`, { id }, { transferMode: 'path' })

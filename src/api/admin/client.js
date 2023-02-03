/** 终端 */
import { request } from '@/api'

const url = `/admin/client`

/** 新增终端 */
export const saveClient = (data) => request.post(url, data)

/** 通过id删除终端 */
export const deleteClientById = (clientId) => request.delete(url, { clientId }, { transferMode: 'path' })

/** 修改第终端 */
export const updateClient = (data) => request.put(url, data)

/** 终端分页查询 */
export const getClient = (data) => request.get(`${url}/page`, data)

/** 终端通过id查询 */
export const getClientById = (id) => request.get(url, { id }, { transferMode: 'path' })

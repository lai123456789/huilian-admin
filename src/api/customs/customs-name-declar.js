/** 报关名称归类 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsNameDeclar`

/** 新增报关名称归类 */
export const saveCustomsNameDeclar = (data) => request.post(`${url}/save`, data)

/** 通过id删除报关名称归类 */
export const deleteCustomsNameDeclarById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改报关名称归类 */
export const updateCustomsNameDeclar = (data) => request.post(`${url}/update`, data)

/** 报关名称归类分页查询 */
export const getCustomsNameDeclar = (data) => request.get(`${url}/page`, data)

/** 报关名称归类通过id查询 */
export const getCustomsNameDeclarById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


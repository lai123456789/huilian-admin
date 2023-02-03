/** 运输方式代码 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclTransport`

/** 新增运输方式代码 */
export const saveBaseCclTransport = (data) => request.post(`${url}/save`, data)

/** 通过id删除运输方式代码 */
export const deleteBaseCclTransportById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改运输方式代码 */
export const updateBaseCclTransport = (data) => request.post(`${url}/update`, data)

/** 运输方式代码分页查询 */
export const getBaseCclTransport = (data) => request.get(`${url}/page`, data)

/** 运输方式代码通过id查询 */
export const getBaseCclTransportById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 只查询系统业务支持的运输方式 */
export const getBaseCclTransportSupportTransportList = (data) => request.get(`${url}/supportTransportList`, data)

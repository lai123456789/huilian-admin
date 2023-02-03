/** 公共参数 */
import { request } from '@/api'

export const url = `/admin/sysPublicParam`

/** 新增公共参数 */
export const saveSysPublicParam = (data) => request.post(`${url}/save`, data)

/** 通过id删除公共参数 */
export const deleteSysPublicParamById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改公共参数 */
export const updateSysPublicParam = (data) => request.post(`${url}/update`, data)

/** 公共参数分页查询 */
export const getSysPublicParam = (data) => request.get(`${url}/page`, data)

/** 公共参数通过id查询 */
export const getSysPublicParamById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 同步缓存公共参数 */
export const syncSysPublicParam = () => request.put(`${url}/sync`)

/** 公共参数-通过参数key获取参数value */
export const publicValueSysPublicParamByPublicKey = (publicKey) => request.get(`${url}/publicValue`, { publicKey }, { transferMode: 'path' })

/** 公共参数-修改参数配置 */
export const updatePublicValueSysPublicParam = (data) => request.post(`${url}/updatePublicValue`, data, { transferMode: 'form' })

/** 公共参数-获取系统(版权-LOGO)等配置 */
export const getSystemParamSysPublicParam = () => request.get(`${url}/getSystemParam`)


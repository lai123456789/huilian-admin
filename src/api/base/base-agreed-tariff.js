/** 协定关税 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseAgreedTariff`

/** 新增协定关税 */
export const saveBaseAgreedTariff = (data) => request.post(`${url}/save`, data)

/** 通过id删除协定关税 */
export const deleteBaseAgreedTariffById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改协定关税 */
export const updateBaseAgreedTariff = (data) => request.post(`${url}/update`, data)

/** 协定关税分页查询 */
export const getBaseAgreedTariff = (data) => request.get(`${url}/page`, data)

/** 协定关税通过id查询 */
export const getBaseAgreedTariffById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


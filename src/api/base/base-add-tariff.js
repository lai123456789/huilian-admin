/** 加征关税 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseAddTariff`

/** 新增加征关税 */
export const saveBaseAddTariff = (data) => request.post(`${url}/save`, data)

/** 通过id删除加征关税 */
export const deleteBaseAddTariffById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改加征关税 */
export const updateBaseAddTariff = (data) => request.post(`${url}/update`, data)

/** 加征关税分页查询 */
export const getBaseAddTariff = (data) => request.get(`${url}/page`, data)

/** 加征关税通过id查询 */
export const getBaseAddTariffById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


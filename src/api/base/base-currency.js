/** 币别 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCurrency`

/** 新增币别 */
export const saveBaseCurrency = (data) => request.post(`${url}/save`, data)

/** 通过id删除币别 */
export const deleteBaseCurrencyById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改币别 */
export const updateBaseCurrency = (data) => request.post(`${url}/update`, data)

/** 币别分页查询 */
export const getBaseCurrency = (data) => request.get(`${url}/page`, data)

/** 币别通过id查询 */
export const getBaseCurrencyById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

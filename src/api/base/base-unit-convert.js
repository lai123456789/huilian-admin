/** 申报单位转换 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseUnitConvert`

/** 新增申报单位转换 */
export const saveBaseUnitConvert = (data) => request.post(`${url}/save`, data)

/** 通过id删除申报单位转换 */
export const deleteBaseUnitConvertById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改申报单位转换 */
export const updateBaseUnitConvert = (data) => request.post(`${url}/update`, data)

/** 申报单位转换分页查询 */
export const getBaseUnitConvert = (data) => request.get(`${url}/page`, data)

/** 申报单位转换通过id查询 */
export const getBaseUnitConvertById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })


/** 字典管理 */
import { request } from '..'
import { isString, isArray } from 'xe-utils'
export const url = '/admin/dict'
export const itemUrl = '/admin/dict/item'

/** 新增字典 */
export const saveDict = data => request.post(url, data)

/** 通过id删除字典 */
export const deleteDictById = id => request.delete(url, { id }, { transferMode: 'path' })

/** 修改字典 */
export const updateDict = data => request.put(url, data)

/** 字典分页查询 */
export const getDict = data => request.get(`${url}/page`, data)

/** 字典通过id查询 */
export const getDictById = id => request.get(url, { id }, { transferMode: 'path' })

/** 同步缓存字典 */
export const syncDict = () => request.put(`${url}/sync`)

/** 通过字典类型查询 */
export const getDictByType = type => request.get(`${url}/type`, { type }, { transferMode: 'path' })

/** 新增字典项 */
export const saveDictItem = data => request.post(itemUrl, data)

/** 通过id删除字典项 */
export const deleteDictItemById = id => request.delete(itemUrl, { id }, { transferMode: 'path' })

/** 修改字典项 */
export const updateDictItem = data => request.put(itemUrl, data)

/** 字典项分页查询 */
export const getDictItem = data => request.get(`${itemUrl}/page`, data)

/** 字典项通过id查询 */
export const getDictItemById = id => request.get(itemUrl, { id }, { transferMode: 'path' })

/** 根据参数获取数据字典 */
export const getDataDictionary = async (payload = []) => {
  if (isString(payload) && payload) {
    const { data } = await getDictByType(payload)
    return data
  } else if (isArray(payload) && payload.length) {
    const result = {}
    if (payload.length) {
      const res = await Promise.all(payload.map(v => getDictByType(v)))
      res.forEach(v => {
        if (v.code === 0) {
          if (v.data.length) {
            const type = v.data[0].type
            result[type] = v.data
          }
        }
      })
      return result
    }
  } else {
    return {}
  }
}

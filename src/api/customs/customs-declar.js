/** 商品归类库 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsDeclar`

/** 新增商品归类库 */
export const saveCustomsDeclar = (data) => request.post(`${url}/save`, data)

/** 通过id删除商品归类库 */
export const deleteCustomsDeclarById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改商品归类库 */
export const updateCustomsDeclar = (data) => request.post(`${url}/update`, data)

/** 商品归类库分页查询 */
export const getCustomsDeclar = (data) => request.get(`${url}/page`, data)

/** 商品归类库通过id查询 */
export const getCustomsDeclarById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 商品批量归类 */
export const batchDeclareCustomsDeclar = (data) => request.post(`${url}/batchDeclare`, data)

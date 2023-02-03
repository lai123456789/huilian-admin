/** 凭证模板 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseVoucherTemplate`

/** 新增凭证模板 */
export const saveBaseVoucherTemplate = (data) => request.post(`${url}/save`, data)

/** 通过id删除凭证模板 */
export const deleteBaseVoucherTemplateById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改凭证模板 */
export const updateBaseVoucherTemplate = (data) => request.post(`${url}/update`, data)

/** 凭证模板分页查询 */
export const getBaseVoucherTemplate = (data) => request.get(`${url}/page`, data)

/** 凭证模板通过id查询 */
export const getBaseVoucherTemplateById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

/** 通过模板编号查询 */
export const getBaseVoucherTemplateByTemplateNo = (data) => request.get(`${url}/getByTemplateNo`, data)

/** 根据凭证模板编号和查询参数，查询业务单据列表 */
export const getBaseVoucherTemplateByBusinessPage = (data) => request.get(`${url}/queryBusinessPage`, data)

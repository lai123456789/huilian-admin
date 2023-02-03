/** 结算公式配置 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseSettlementFormula`

/** 新增结算公式配置 */
export const saveBaseSettlementFormula = (data) => request.post(`${url}/save`, data)

/** 通过id删除结算公式配置 */
export const deleteBaseSettlementFormulaById = (id) => request.post(`${url}/delete`, { id }, { transferMode: 'path' })

/** 修改结算公式配置 */
export const updateBaseSettlementFormula = (data) => request.post(`${url}/update`, data)

/** 结算公式配置分页查询 */
export const getBaseSettlementFormula = (data) => request.get(`${url}/page`, data)

/** 结算公式配置通过id查询 */
export const getBaseSettlementFormulaById = (id) => request.get(`${url}/get`, { id }, { transferMode: 'path' })

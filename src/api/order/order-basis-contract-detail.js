/** 基差合同明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderBasisContractDetail`

/** 代销订单分页查询 */
export const getOrderBasisContractDetail = (data) => request.get(`${url}/page`, data)

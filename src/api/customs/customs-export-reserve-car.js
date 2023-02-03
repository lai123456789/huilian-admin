/** 出口跨境订车计划 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsExportReserveCar`

/** 出口跨境订车计划分页查询 */
export const getCustomsExportReserveCar = data => request.get(`${url}/page`, data)

/** 出口跨境订车生成报关运输单 */
export const generateCustomsExportReserveCar = data => request.post(`${url}/generateCustomsTransport`, data)

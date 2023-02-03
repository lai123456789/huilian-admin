/** 进口跨境订车计划 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/customsImportReserveCar/`

/** 进口跨境订车计划分页查询 */
export const getCustomsImportReserveCar = data => request.get(`${url}/page`, data)

/** 进口跨境订车生成报关运输单 */
export const generateCustomsImportReserveCar = data => request.post(`${url}/generateCustomsTransport`, data)

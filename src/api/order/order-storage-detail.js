/** 仓储订单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderStorageDetail`
export const orderStorageDetailImportUrl = `${url}/importDetail`
export const orderStorageDetailExportUrl = `${url}/exportDetail`

/** 仓储订单明细-查询可入库的订单明细 */
export const getForReceivingOrderStorageDetail = (data) => request.post(`${url}/getForReceiving`, data, { transferMode: 'form' })

/** 仓储订单明细-查询可出库的订单明细 */
export const getForShippingOrderStorageDetail = (data) => request.get(`${url}/getForShipping`, data)

/** 修改仓储订单价格 */
export const updatePriceOrderStorageDetail = (data) => request.post(`${url}/updatePrice`, data, { transferMode: 'form' })

/** 仓储订单明细-分页查询 */
export const getOrderStorageDetail = (data) => request.get(`${url}/page`, data)


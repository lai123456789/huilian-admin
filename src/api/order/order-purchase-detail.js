/** 采购订单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderPurchaseDetail`
export const orderPurchaseDetailImportUrl = `${url}/importDetail`
export const orderPurchaseDetailExportUrl = `${url}/exportDetail`

/** 采购订单明细-查询可入库的订单明细 */
export const getForReceivingOrderPurchaseDetail = (data) => request.post(`${url}/getForReceiving`, data, { transferMode: 'form' })

/** 采购订单明细-分页查询 */
export const getOrderPurchaseDetail = (data) => request.get(`${url}/page`, data)


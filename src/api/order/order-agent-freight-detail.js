/** 货代订单明细 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/orderAgentFreightDetail`
export const orderAgentFreightDetailImportUrl = `${url}/importDetail`
export const orderAgentFreightDetailExportUrl = `${url}/exportDetail`

/** 货代订单明细-查询可入库的订单明细 */
export const getForReceivingOrderAgentFreightDetail = (data) => request.post(`${url}/getForReceiving`, data, { transferMode: 'form' })

/** 货代订单明细-查询可出库的订单明细 */
export const getForShippingOrderAgentFreightDetail = (data) => request.get(`${url}/getForShipping`, data)

/** 修改货代订单价格 */
export const updatePriceOrderAgentFreightDetail = (data) => request.post(`${url}/updatePrice`, data, { transferMode: 'form' })

/** 货代订单明细-分页查询 */
export const getOrderAgentFreightDetail = (data) => request.get(`${url}/page`, data)

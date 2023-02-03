/** 首页 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/index`

/** 月数据统计 */
export const queryMonthData = (data) => request.get(`${url}/queryMonthData`, data)

/** 日数据统计 */
export const queryDayData = (data) => request.get(`${url}/queryDayData`, data)

/** 获取外汇汇率 */
export const getForeignRateList = (data) => request.get(`${url}/getForeignRateList`, data)

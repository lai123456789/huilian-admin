import enums from '../utils'

/** 外汇牌价类型 */
export default enums({
  /** 现汇买入价 */
  PER: ['0', '现汇买入价'],
  /** 现钞买入价 */
  EXCHOFFER: ['1', '现钞买入价'],
  /** 现汇卖出价 */
  EXCHBID: ['2', '现汇卖出价'],
  /** 现钞卖出价 */
  CASHBID: ['3', '现钞卖出价']
})

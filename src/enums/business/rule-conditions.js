import enums from '../utils'

/** 数据权限规则条件 */
export default enums({
  /** 大于 */
  GT: ['>', '大于'],
  /** 大于等于 */
  GE: ['>=', '大于等于'],
  /** 小于 */
  LT: ['<', '小于'],
  /** 小于等于 */
  LE: ['<=', '小于等于'],
  /** 等于 */
  EQUAL: ['=', '等于'],
  /** 不等于 */
  NE: ['!=', '不等于'],
  /** 包含 */
  IN: ['IN', '包含'],
  /** 全模糊 */
  LIKE: ['LIKE', '全模糊'],
  /** 左模糊 */
  LEFT_LIKE: ['LEFT_LIKE', '左模糊'],
  /** 右模糊 */
  RIGHT_LIKE: ['RIGHT_LIKE', '右模糊'],
  /** 带加号等于 */
  EQWITHADD: ['<EQWITHADD', '带加号等于'],
  /** 多词模糊匹配 */
  LIKEWITHAND: ['LIKEWITHAND', '多词模糊匹配'],
  /** 自定义SQL片段 */
  USE_SQL_RULES: ['USE_SQL_RULES', '自定义SQL片段']
})

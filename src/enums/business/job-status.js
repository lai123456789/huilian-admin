import enums from '../utils'

/** 定时任务状态 */
export default enums({
  /** 已发布 */
  RELEASED: ['1', '已发布'],
  /** 运行中 */
  IN_SERVICE: ['2', '运行中'],
  /** 暂停 */
  STOP: ['3', '暂停']
})

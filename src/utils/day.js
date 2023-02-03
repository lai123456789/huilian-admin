/**
 * 时间日期操作工具方法基于(day.js)[https://dayjs.gitee.io/zh-CN/]
 * 单独写在这个文件引入并导入是因为便于扩展插件和扩展day.js方法
 */
import dayjs from 'dayjs'

/** dayjs 扩展方法 2个日期范围组成的数组 */
const Range = (_a, _c, d) => {
  /**
  * 处理2个日期时间对象之间范围为数组方法
  * @param start 开始时间
  * @param end 结束时间
  * @param amount 间隔值 eg: '2022-01-01' ~ '2022-01-31' 之间 且 amount 值为2 返回的数组是 ["2022-01-01", "2022-01-03", "2022-01-05" ...]
  * @param unit 单位值
  * @param format 格式规则
  * @returns 2个日期对象范围的数组
  */
  d.range = (start, end, amount = 1, unit = 'day', format = 'YYYY-MM-DD') => {
    const ranges = []
    const _start = dayjs.isDayjs(start) ? start : dayjs(start)
    const _end = dayjs.isDayjs(end) ? end : dayjs(end)
    let d = dayjs(_start)

    while (d.isBefore(_end) || d.isSame(_end)) {
      ranges.push(d.format(format))
      d = d.add(amount, unit)
    }

    return ranges
  }
}

dayjs.extend(Range)

export default dayjs


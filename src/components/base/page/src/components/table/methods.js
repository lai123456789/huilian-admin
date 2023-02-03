/* eslint-disable no-case-declarations */
import { isEmpty, isPlainObject, isNumber } from 'xe-utils'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'

/**
 * 获取单元格文本宽度
 * @param {string|number} str
 * @returns {number}
 */
export const getCellTextWidth = (str) => {
  let width

  const html = document.createElement('span')
  html.innerText = String(str)
  html.className = '_GET_TEXT_WIDTH_'
  html.style.whiteSpace = 'normal'
  html.style.wordBreak = 'break-all'
  html.style.fontSize = '12px'
  html.style.display = 'inline-block'
  html.style.padding = '0 12px'
  document.querySelector('body').appendChild(html)
  // eslint-disable-next-line prefer-const
  width = document.querySelector('._GET_TEXT_WIDTH_').offsetWidth
  document.querySelector('._GET_TEXT_WIDTH_').remove()
  return width
}

/**
 * 算出该列数据中的最大的宽度
 * @param {array<any>} data
 * @returns {number}
 */
export const columnAdaptive = (data) => {
  return data.reduce((initiaValue, v) => {
    if (v) {
      const textWidth = getCellTextWidth(v)
      if (initiaValue < textWidth) {
        initiaValue = textWidth
      }
    }
    return initiaValue
  }, 0)
}

/**
 * 处理列数据中 formatter 字段 (数据字典、金额(千分符)、时间、数字保留位数)
 * @param {object|function} formatter 格式化对象或者函数
 * @param {array} optionsCache 数据字典的
 * @param {any} cellValue 值
 */
export const handleFormatter = (formatter, cellValue, optionsCache) => {
  let result = cellValue
  if (isPlainObject(formatter) && !isEmpty(formatter)) {
    // 是否有传入 type 字段
    if (!formatter.type) throw new Error(`formatter 选项中的 type 字段必须定义(值: number|percent|date|options)`)
    switch (formatter.type) {
      case 'number':
        // 金额数据列默认保留2位小数
        result = isNumber(cellValue) ? new BigNumber(cellValue).dp((formatter.config && formatter.config.precision) || 2).toFormat(Object.assign({
          decimalSeparator: '.',
          groupSeparator: ',',
          groupSize: 3,
          secondaryGroupSize: 0,
          fractionGroupSeparator: ' ',
          fractionGroupSize: 0
        }, formatter.config)) : cellValue
        break
      case 'percent':
        result = isNumber(Number(cellValue)) ? `${new BigNumber(Number(cellValue)).times(100)}%` : cellValue
        break
      case 'date':
        result = dayjs(Number(cellValue)).format((formatter.config && formatter.config.valueFormat) || 'YYYY-MM-DD HH:mm:ss')
        break
      case 'options':
        const target2 = optionsCache.find(v => v[formatter.config ? formatter.config.valueKey || 'value' : 'value'] === cellValue)
        result = target2 ? target2[formatter.config ? formatter.config.labelKey || 'label' : 'label'] : cellValue
        break
    }
  }
  return result
}

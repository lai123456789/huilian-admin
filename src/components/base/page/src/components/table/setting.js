import { clone } from 'xe-utils'
import { getStorage, setStorage } from '@/utils/storage'
import config from '@/config'

/**
 * 处理用户操作排序后的列数据
 * @param {array<any>} colums1 列数据
 * @param {array<any>} colums2 缓存列数据
 */
const handleColumnsIndividuaSort = (colums1, colums2) => {
  const cloneColumns1 = clone(colums1, true)
  const cloneColumns2 = clone(colums2, true)
  // 算出2个数组差异，返回的差异的元素组成的数组
  const columnsDiff1 = cloneColumns1.filter(v => cloneColumns2.every(e => e.field !== v.field))
  const columnsDiff2 = cloneColumns2.filter(v => cloneColumns1.every(e => e.field !== v.field))

  //  缓存的列数据是否有增加实际的列数据没定义的列，没有的话删除缓存的列数据中对应的项
  columnsDiff2.forEach((v) => {
    const curIndex = cloneColumns2.findIndex(vv => vv.field === v.field)
    cloneColumns2.splice(curIndex, 1)
  })

  columnsDiff1.forEach((v) => {
    if (cloneColumns1.includes(v)) {
      /**
        TODO 两种方式的列数据的排序；注释的这种是根据上一位的列数据的后面插入，获取到当前的元素的上一个元素的下标
      */
      // const preIndex = cloneColumns1.findIndex(vv => vv.field === v.field) - 1
      // if (preIndex < 0) {
      //   cloneColumns2.unshift(v)
      // } else {
      //   const ele = cloneColumns1[preIndex]
      //   const curIndex = cloneColumns2.findIndex(vv => vv.field === ele.field)
      //   cloneColumns2.splice(curIndex + 1, 0, v)
      // }

      // 这种方式就是根据开发者文件定义的方式来决定位置
      const curIndex = cloneColumns1.findIndex(vv => vv.field === v.field)
      cloneColumns2.splice(curIndex, 0, v)
    }
  })

  return cloneColumns2
}

/**
 * 处理用户操作显隐的列数据
 * @param {array<any>} columns 实际列数据
 * @param {array} cacheColumns 缓存列数据
 */
const handleColumnsIndividuaOvertCovert = (columns, cacheColumns) => {
  return columns.map(v => {
    const target = cacheColumns.find(vv => vv.field === v.field)
    // 以实际的列数据为准, 因为可能会更新某一个列数据上面的值，否则会导致跟缓存的列数据不同步的问题
    // 给每一个列数据添加一个叫 isOvertCovert 字段做标识
    return target ? Object.assign({}, target, v) : Object.assign({}, v, { isOvertCovert: true })
  })
}

/**
 * 对列数据进行个性化配置(主要对列显隐、列排序进行本地缓存)
 * @param {array<any>} columns 实际列数据
 * @param {string} currentTableName 当前表格的唯一名称
 */
export const handleColumnsIndividua = (columns, currentTableName) => {
  let result
  const tableName = `${config.tablePrefix}_${currentTableName}`
  // 获取本地缓存的列数据
  /**
   * @type {array} 从本地存储获取列数据
   */
  const cacheColumns = getStorage({ name: tableName })

  if (cacheColumns) {
    let latest = []
    const transfers = []

    // 获取用户操作排序和显隐后的列数据
    latest = handleColumnsIndividuaSort(handleColumnsIndividuaOvertCovert(columns, cacheColumns), cacheColumns)
    // 更新一下本地的数据
    setStorage({ name: tableName, content: latest })

    // 把 isOvertCovert 为 false 的数据过滤掉，形成最后的列数据输出
    for (let i = 0; i < latest.length; i++) {
      const item = latest[i]
      if (item.isOvertCovert) {
        const target = columns.find(v => item.field === v.field)
        if (target) {
          transfers.push(target)
        }
      }
    }
    result = transfers
  } else {
    result = columns
  }
  return result
}

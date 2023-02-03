/* 封装 localStorage 和 sessionStorage */

import { isNull } from 'xe-utils'
import config from '@/config'

/**
 * 设置
 * @param {Object} params
 */
export const setStorage = (params) => {
  const { name, content, type } = params
  params.name = `${config.prefix}_${name}`
  const obj = {
    dataType: typeof content,
    content,
    type,
    datetime: new Date().getTime()
  }
  !params || (params && type === 'session')
    ? window.sessionStorage.setItem(params.name, JSON.stringify(obj))
    : window.localStorage.setItem(params.name, JSON.stringify(obj))
}

/**
 * 获取
 * @param {Object} params
 * @returns {any}
 */
export const getStorage = (params) => {
  const { name } = params
  params.name = `${config.prefix}_${name}`
  let obj = window.sessionStorage.getItem(params.name)
  let content = null

  // 如果第一次从sessionStorage获取到为null, 则从localStorage里面获取, 如果为null则本地不存在
  if (isNull(obj)) obj = window.localStorage.getItem(params.name)
  if (isNull(obj)) return

  try {
    obj = JSON.parse(obj)
  } catch (e) {
    return obj
  }

  switch (obj.dataType) {
    case 'string':
      content = obj.content
      break
    case 'number':
      content = Number(obj.content)
      break
    case 'boolean':
      // eslint-disable-next-line no-eval
      content = eval(obj.content)
      break
    case 'object':
      content = obj.content
      break
  }
  return content
}

/**
 * 删除指定
 * @param {Object} params
 */
export const removeStorage = (params) => {
  const { name, type } = params
  params.name = `${config.prefix}_${name}`
  !params || (params && type === 'session')
    ? window.sessionStorage.removeItem(params.name)
    : window.localStorage.removeItem(params.name)
}

/**
 * 获取全部
 * @param {Object} params
 */
export const getAllStorage = (params) => {
  const list = []
  const { type } = params
  if (!params || (params && type === 'session')) {
    for (let i = 0; i <= window.sessionStorage.length; i++) {
      list.push({
        name: window.sessionStorage.key(i),
        content: getStorage({
          name: window.sessionStorage.key(i),
          type: 'session'
        })
      })
    }
  } else {
    for (let i = 0; i <= window.localStorage.length; i++) {
      list.push({
        name: window.localStorage.key(i),
        content: getStorage({ name: window.localStorage.key(i) })
      })
    }
  }
  return list
}

/**
 * 清空全部
 * @param {Object} params
 */
export const clearStorage = (params) => {
  !params || (params && params.type === 'session') ? window.sessionStorage.clear() : window.localStorage.clear()
}

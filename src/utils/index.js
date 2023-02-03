import { request } from '@/api'
import { url as fileUrl } from '@/api/admin/sys-file'
import { getMenuTree } from '@/api/admin/menu'
import { getOrderImportById } from '@/api/order/order-import'
import { getOrderExportById } from '@/api/order/order-export'
import { getOrderAgentPurchaseById } from '@/api/order/order-agent-purchase'
import { getOrderPurchaseById } from '@/api/order/order-purchase'
import { getOrderSaleById } from '@/api/order/order-sale'
import { getOrderAgentSaleById } from '@/api/order/order-agent-sale'
import { getOrderAgentFreightById } from '@/api/order/order-agent-freight'
import { getOrderStorageById } from '@/api/order/order-storage'
import { isArray } from 'xe-utils'
import enums from '@/enums'

/* base */

/**
 * @desc 判断是否为外部链接
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @desc 是否为正确的手机号格式
 * @param {string} payload 手机号
 * @param {'nd' | 'hk' | 'mo' | 'tw' | 'all'} region 区域
 * @returns {boolean}
 */
export function isMobileNo(payload, region = 'nd') {
  const reg = {
    nd: /^(1[3-9]\d{9})$/,
    hk: /^([5|6|8|9]\d{7})$/,
    mo: /^([6]\d{5})$/,
    tw: /^(09\d{8})$/,
    all: /^(1[3-9]\d{9})$|^([5|6|8|9]\d{7})$|^([6]\d{5})$|^(09\d{8})$/
  }

  return reg[region].test(payload)
}

/**
 * @desc 是否为正确的邮箱格式
 * @param {string} payload 邮箱
 * @returns {boolean}
 */
export function isEmail(payload) {
  const reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
  return reg.test(payload)
}

/**
 * @desc 是否为正确的身份证号格式
 * @param {string} payload 身份证号
 * @param {'nd' | 'hk' | 'mo' | 'tw'} region 区域
 * @returns {boolean}
 */
export function isIdCard(payload, region = 'nd') {
  const reg = {
    nd: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
    hk: /^((\s?[A-Za-z])|([A-Za-z]{2}))\d{6}(\([0−9aA]\)|[0-9aA])$/,
    mo: /^[1|5|7][0-9]{6}\([0-9Aa]\)/,
    tw: /^[a-zA-Z][0-9]{9}$/
  }
  return reg[region].test(payload)
}

/**
 * @desc 是否为正确的统一社会信用代码格式
 * @param {string} payload  统一社会信用代码
 * @returns {boolean}
 */
export function isSocialCreditCode(payload) {
  const patrn = /^[0-9A-Z]+$/ // 18位校验及大写校验
  if (payload.length !== 18 || patrn.test(payload) === false) {
    return false
  } else {
    let ancode // 统一社会信用代码的每一个值
    let ancodevalue // 统一社会信用代码每一个值的权重
    let total = 0
    const weightedfactors = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28] // 加权因子
    const strAlphabet = '0123456789ABCDEFGHJKLMNPQRTUWXY' // 不用I、O、S、V、Z
    for (let i = 0; i < payload.length - 1; i++) {
      ancode = payload.substring(i, i + 1)
      ancodevalue = strAlphabet.indexOf(ancode)
      total = total + ancodevalue * weightedfactors[i] // 权重与加权因子相乘之和
    }
    let logiccheckcode = 31 - (total % 31)
    if (logiccheckcode === 31) {
      logiccheckcode = 0
    }
    const strNumber = '0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,T,U,W,X,Y'
    const strs = strNumber.split(',')
    logiccheckcode = strs[logiccheckcode]
    const checkcode = payload.substring(17, 18)
    if (logiccheckcode !== checkcode) {
      return false
    }
    return true
  }
}

/**
 * @desc 判断图片链接是否可用
 * @param {string} url 地址
 * @returns {promise<boolean>}
 */
export function isImageUsable(url) {
  return new Promise((resolve, reject) => {
    const imgObj = new Image()
    imgObj.src = url
    imgObj.addEventListener('load', () => {
      resolve(imgObj.fileSize > 0 || (imgObj.width > 0 && imgObj.height > 0))
    })
    imgObj.addEventListener('error', () => {
      reject(false)
    })
  })
}

/* function */

/**
 * @desc 处理转换数组类型参数的方法(逗号分隔)
 * @param {object} payload
 * @param {array<string>} exclude 忽略处理字段数组
 * @returns {object}
 */
export function transforArrayPayload(payload, exclude = []) {
  const result = {}
  for (const key in payload) {
    if (Object.hasOwnProperty.call(payload, key)) {
      const item = payload[key]
      result[key] = isArray(item) && !exclude.includes(key) ? item.join(',') : item
    }
  }
  return result
}

/**
 * @desc 类似实现后台的分页查询的功能
 * @param {array} data 数据
 * @param {object} condition 过滤条件
 * @param {object} pager 分页参数
 * @returns {array} 过滤之后的数据
 */
export function getPagesByCondition(data, condition, pager = {}) {
  const total = data.length
  let current = 0
  let size = 0
  let start = 0
  let end = total

  if (Object.keys(pager).length > 0) {
    current = pager.current || 1
    size = pager.size || total
    start = (current - 1) * size
    end = start + size
  }

  return data
    .filter(v => {
      return Object.keys(condition).every(key => {
        return String(v[key]).toLowerCase().includes(String(condition[key]).trim().toLowerCase())
      })
    })
    .slice(start, end)
}

/**
 * @desc 模拟鼠标按下事件
 */
export function simulateMousedownEvent() {
  const event = document.createEvent('MouseEvents')
  event.initEvent('mousedown', true, true)
  document.body.dispatchEvent(event)
}

/* string */

/* web */

/**
 * @desc 设置浏览器标签栏的图标
 * @sign 业务方法
 * @param {string} url 地址
 */
export function setBrowserTabIcon(url) {
  const favicon = document.getElementById('favicon')
  if (favicon) {
    favicon.remove()
  }
  const link = document.createElement('link')
  link.id = 'favicon'
  link.type = 'image/x-icon'
  link.rel = 'shortcut icon'
  isImageUsable(url)
    .then(isUsable => {
      link.href = isUsable ? url : require('@/assets/login/login-logo@2.x.png')
      document.getElementsByTagName('head')[0].appendChild(link)
    })
    .catch(() => {
      link.href = require('@/assets/login/login-logo@2.x.png')
      document.getElementsByTagName('head')[0].appendChild(link)
    })
}

/**
 * @desc 附件下载
 * @sign 业务方法
 * @param {string} url
 * @param {object} params
 * @param {string} fileName
 * @returns {promise<void>}
 */
export async function fileDownload(url, params, fileName, isQuery = true, b) {
  let blob = b
  if (isQuery) {
    const response = await request.get(url, params, { responseType: 'blob' })
    blob = response
    if (blob && blob.size === 0) {
      this.$notify.error('内容为空，无法下载')
      return
    }
  }
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  window.setTimeout(function () {
    URL.revokeObjectURL(blob)
    document.body.removeChild(link)
  }, 0)
}

/**
 * @desc 附件预览
 * @sign 业务方法
 * @param {object} fileInfo
 * @param {string} fileInfo.fileName
 * @param {string} fileInfo.path
 */
export function filePrevie(fileInfo) {
  const { fileName, path } = fileInfo
  const index = fileName.lastIndexOf('.')
  const ext = fileName.substr(index + 1)
  if (['jpg', 'JPG', 'jpeg', 'JPEG', 'gif', 'GIF', 'png', 'PNG', 'pdf', 'PDF'].includes(ext)) {
    window.open(`${window.location.origin}${fileUrl}/preView/${path}`, '_blank')
  } else {
    fileDownload(fileInfo)
  }
}

/**
 * @desc 根据当前菜单id生成子级页签数据
 * @sign 业务方法
 * @param {string} id
 */
export function createTabsOpitonsByMenuId(id) {
  return new Promise((resolve, reject) => {
    getMenuTree({ parentId: id })
      .then(res => {
        const tabs = []
        res.data.forEach(v => {
          if (v.type === enums.MENU_TYPE.getFieldByKey('TABS')) {
            tabs.push({
              label: v.name,
              path: v.path,
              permission: v.permission
            })
          }
        })
        resolve(tabs)
      })
      .catch(error => {
        reject(error)
      })
  })
}

/**
 * @desc 根据订单类型获取订单详情接口
 * @sign 业务方法
 * @param {string} orderType
 */
export function getOrderByIdAndType(orderType) {
  let port = null
  switch (orderType) {
    case enums.ORDER_TYPE.getFieldByKey('IMPORT'):
      port = getOrderImportById
      break
    case enums.ORDER_TYPE.getFieldByKey('EXPORT'):
      port = getOrderExportById
      break
    case enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'):
      port = getOrderAgentPurchaseById
      break
    case enums.ORDER_TYPE.getFieldByKey('SALE'):
      port = getOrderSaleById
      break
    case enums.ORDER_TYPE.getFieldByKey('AGENT_SALE'):
      port = getOrderAgentSaleById
      break
    case enums.ORDER_TYPE.getFieldByKey('PURCHASE'):
      port = getOrderPurchaseById
      break
    case enums.ORDER_TYPE.getFieldByKey('STORAGE'):
      port = getOrderStorageById
      break
    case enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT'):
      port = getOrderAgentFreightById
      break
  }
  return port
}


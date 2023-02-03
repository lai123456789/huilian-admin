import axios from 'axios'
import qs from 'querystring'
import store from '@/store'
import router from '@/router'
import { loginUrl, checkTokenUrl } from '@/api/admin/auth'
import { url as sysParamsUrl } from '@/api/admin/sys-public-param'
import { getStorage } from '@/utils/storage'
import { message } from '@/utils/message'
import constant from '@/constant'
import sysConfig from '@/config'
import enums from '@/enums'

let canExsit = void 0

// 可以用validateStatus定义一个http状态码返回的范围, 只要状态码是大于等于200小于等于503时 promise 将 resolved 反之 rejected.
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status <= 503 // 默认的
}

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: true,
  timeout: 50000
})

service.interceptors.request.use(
  config => {
    if (store.getters.accessToken) {
      // 以下接口不需要token
      if (config.url !== loginUrl && config.url !== checkTokenUrl && config.url !== sysParamsUrl) {
        config.headers.Authorization = `Bearer ${getStorage({ name: constant.STORAGE_ACCESS_TOKEN })}`
      }
    }

    Object.assign(config.headers, process.env.NODE_ENV === 'development' ? sysConfig.apiHeaders : {})
    return config
  },
  error => {
    console.error('axios请求拦截错误: ', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const status = response.status
    const res = response.data

    // 状态码成功(200)
    if (status === 200) {
      // 有返回业务状态码
      if (Object.hasOwnProperty.call(res, 'code')) {
        // 业务状态码成功
        if (res.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
          return Promise.resolve(res)
          // 业务状态码失败
        } else if (res.code === 1) {
          message.error(res.msg)
          return Promise.reject(res)
        }
      } else {
        return res
      }
    } else {
      // 没有权限时会返回(token过期)
      if (status === 401) {
        if (canExsit) return
        canExsit = true
        store.dispatch('user/retracement')
        canExsit = void 0
        const msg = '登录状态失效, 请重新登录!'
        message.error(msg)
        router.replace('/login')
        return Promise.reject(new Error(msg))
        // 这种情况是没有权限(校验token的接口会报424)
      } else if (status === 404) {
        message.error('资源不存在')
        return Promise.reject(new Error('资源不存在'))
      } else if (status === 424) {
        // 校验token的接口报424的关闭刷新token的轮询
        store.dispatch('user/resetRefreshTokenState')
        return Promise.reject(new Error('令牌未被识别:', res.msg))
        // 服务器错误会返回
      } else if (status === 500) {
        const msg = '服务器异常,请联系管理员'
        message.error(msg)
        return Promise.reject(new Error(msg))
      }
      if (status === 502 || status === 503) {
        const msg = '服务重启中'
        message.error(msg)
        return Promise.reject(new Error(msg))
      } else {
        // 后面的没有判断状态码统统为弹出`服务器异常`
        message.error(res.msg || '服务器异常,请联系管理员')
        return Promise.reject(new Error(res.msg))
      }
    }
  },
  error => {
    console.error('axios响应拦截错误: ', error)
    return Promise.reject(error)
  }
)

export const request = {
  /** get请求 */
  get(url, params, other) {
    if (other && Object.prototype.hasOwnProperty.call(other, 'transferMode')) {
      switch (other.transferMode) {
        case 'path':
          url = `${url}/${Object.values(params).join('/')}`
          params = undefined
          break
      }
    }
    return service({
      url,
      method: 'get',
      params,
      ...other
    })
  },

  /** post请求 */
  post(url, data, other) {
    let transferMode
    if (other && Object.prototype.hasOwnProperty.call(other, 'transferMode')) {
      transferMode = other.transferMode
      switch (other.transferMode) {
        case 'path':
          url = `${url}/${Object.values(data).join('/')}`
          data = undefined
          break
        case 'form':
          Object.assign(other, {
            'Content-Type': 'application/x-www-form-urlencoded'
          })
          break
      }
    }
    return service({
      url,
      method: 'post',
      data: transferMode === 'form' ? qs.stringify(data) : data,
      ...other
    })
  },

  /** put请求 */
  put(url, data, other) {
    return service({
      url,
      method: 'put',
      data,
      ...other
    })
  },

  /** delete请求 */
  delete(url, data, other) {
    let transferMode
    if (other && Object.prototype.hasOwnProperty.call(other, 'transferMode')) {
      transferMode = other.transferMode
      switch (other.transferMode) {
        case 'path':
          url = `${url}/${Object.values(data).join('/')}`
          data = undefined
          break
        case 'form':
          Object.assign(other, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
          break
      }
    }
    return service({
      url,
      method: 'delete',
      data: transferMode === 'form' ? qs.stringify(data) : data,
      ...other
    })
  }
}

export default service

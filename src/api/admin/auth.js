import { request } from '@/api'
import config from '@/config'
import qs from 'querystring'
import { serialize } from 'xe-utils'

export const loginUrl = '/auth/oauth/token'
export const checkTokenUrl = '/auth/oauth/check_token'
const logoutUrl = '/auth/token/logout'
const getInfoUrl = '/admin/user/info'
const updateInfoUrl = '/admin/user/edit'

/** 登录 */
export const login = data => {
  const OTHER = {}
  if (process.env.NODE_ENV === 'development') {
    Object.assign(OTHER, config.apiHeaders)
  }
  const headers = Object.assign(
    {
      isToken: false,
      Authorization: config.authorization,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' // 避免中文用户名登录乱码
    },
    OTHER
  )
  return request.post(`${loginUrl}?${serialize({ grant_type: 'password' })}`, qs.stringify(data), { headers })
}

/** 获取用户信息 */
export const getInfo = () => request.get(getInfoUrl)

/** 修改用户信息 */
export const updateInfo = (data) => request.put(updateInfoUrl, data)

/** 登出 */
export const logout = () => request.delete(logoutUrl)

/** 刷新token */
export const refreshToken = refreshToken => {
  const grant_type = 'refresh_token'
  const scope = 'server'
  const OTHER = {}
  if (process.env.NODE_ENV === 'development') {
    Object.assign(OTHER, config.apiHeaders)
  }
  const headers = Object.assign(
    {
      isToken: false,
      Authorization: config.authorization
    },
    OTHER
  )
  return request.post(`${loginUrl}?${serialize({ refresh_token: refreshToken, grant_type, scope })}`, { headers })
}

/** 校验令牌，若有效期小于半小时自动续期 */
export const checkToken = token => {
  return request.get(
    checkTokenUrl,
    { token },
    {
      headers: {
        isToken: false,
        Authorization: config.authorization
      }
    }
  )
}

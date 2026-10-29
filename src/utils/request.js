/**
 * 网络请求封装
 * - 统一 baseUrl、超时、错误处理
 * - 自动注入 token
 * - 401 自动清登录态并跳登录页
 * - 断网/超时给出可读提示，不把原始错误抛给用户
 */

const BASE_URL = 'https://api.fangzhu.example.com/v1'
const TIMEOUT = 15000

/** 是否使用本地 mock 数据（开发阶段 true，接后端后改 false） */
export const USE_MOCK = true

let onUnauthorized = null

export function setUnauthorizedHandler (fn) {
  onUnauthorized = fn
}

/** 从存储取 token */
export function getToken () {
  try {
    return uni.getStorageSync('fz_token') || ''
  } catch (e) {
    return ''
  }
}

export function setToken (token) {
  uni.setStorageSync('fz_token', token)
}

export function clearToken () {
  uni.removeStorageSync('fz_token')
  uni.removeStorageSync('fz_user')
}

/**
 * 统一请求方法
 * @param {Object} options { url, method, data, auth, loading, silent }
 * @returns {Promise} 响应 data 字段
 */
export function request (options) {
  const {
    url,
    method = 'GET',
    data = {},
    auth = true,
    loading = false,
    loadingText = '加载中',
    silent = false
  } = options

  if (loading) {
    uni.showLoading({ title: loadingText, mask: true })
  }

  return new Promise((resolve, reject) => {
    const header = {
      'Content-Type': 'application/json'
    }
    if (auth) {
      const token = getToken()
      if (token) header.Authorization = `Bearer ${token}`
    }

    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      timeout: TIMEOUT,
      success: (res) => {
        const { statusCode, data: body } = res

        if (statusCode === 401) {
          clearToken()
          if (!silent) {
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          }
          if (onUnauthorized) onUnauthorized()
          reject({ code: 401, message: '未授权' })
          return
        }

        if (statusCode >= 200 && statusCode < 300) {
          resolve(body && body.data !== undefined ? body.data : body)
          return
        }

        // 业务错误码优先取后端 message
        const msg = (body && (body.message || body.msg)) || `服务异常(${statusCode})`
        if (!silent) {
          uni.showToast({ title: msg, icon: 'none', duration: 2500 })
        }
        reject({ code: statusCode, message: msg, data: body })
      },
      fail: (err) => {
        // 区分断网与超时，给出不同提示
        const raw = (err && err.errMsg) || ''
        let msg = '网络异常，请稍后重试'
        if (/timeout/i.test(raw)) {
          msg = '请求超时，请检查网络'
        } else if (/fail|offline|network/i.test(raw)) {
          msg = '网络已断开，请检查网络设置'
        }
        if (!silent) {
          uni.showToast({ title: msg, icon: 'none', duration: 2500 })
        }
        reject({ code: -1, message: msg, raw })
      },
      complete: () => {
        if (loading) uni.hideLoading()
      }
    })
  })
}

export const http = {
  get: (url, data, opt = {}) => request({ url, method: 'GET', data, ...opt }),
  post: (url, data, opt = {}) => request({ url, method: 'POST', data, ...opt }),
  put: (url, data, opt = {}) => request({ url, method: 'PUT', data, ...opt }),
  del: (url, data, opt = {}) => request({ url, method: 'DELETE', data, ...opt })
}
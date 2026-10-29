/**
 * 全局状态：登录态 + 当前经纪人信息
 * 用 Vue 3 reactive 做成单例，任何页面引入即共享
 */
import { reactive } from 'vue'
import { getToken, setToken, clearToken } from './request.js'

const STORAGE_KEY = 'fz_user'

function loadUser () {
  try {
    return uni.getStorageSync(STORAGE_KEY) || null
  } catch (e) {
    return null
  }
}

export const store = reactive({
  token: getToken(),
  userInfo: loadUser(),
  /** 已读消息数，首页铃铛角标用 */
  unread: 3
})

export function isLogin () {
  return !!store.token
}

export function setLogin (token, userInfo) {
  setToken(token)
  store.token = token
  store.userInfo = userInfo
  uni.setStorageSync(STORAGE_KEY, userInfo)
}

export function updateUser (patch) {
  store.userInfo = { ...(store.userInfo || {}), ...patch }
  uni.setStorageSync(STORAGE_KEY, store.userInfo)
}

export function clearLogin () {
  clearToken()
  uni.removeStorageSync(STORAGE_KEY)
  store.token = ''
  store.userInfo = null
}

/**
 * 页面守卫：需要登录才能进的页面在 onLoad 调用
 * @returns {boolean} 是否已登录
 */
export function requireLogin () {
  if (isLogin()) return true
  uni.navigateTo({
    url: '/pages/login/login',
    fail: () => uni.reLaunch({ url: '/pages/login/login' })
  })
  return false
}
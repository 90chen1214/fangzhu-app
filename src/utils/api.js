/**
 * 接口定义 + Mock 实现
 *
 * 开发期：USE_MOCK = true，走下方 mock 数据，带网络延迟模拟，接口契约与真实一致
 * 上线前：request.js 里把 USE_MOCK 改 false，本文件中的 mock* 函数可整体删除
 */
import { http, USE_MOCK } from './request.js'
import * as mock from './mock.js'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

/* ==================== 登录 / 账号 ==================== */

// 模拟登录：手机号 + 验证码（验证码固定 8888，仅开发期）
export async function login (phone, code) {
  if (USE_MOCK) {
    await delay(600)
    if (!/^1\d{10}$/.test(phone)) {
      throw { code: 400, message: '请输入正确的手机号' }
    }
    if (code !== '8888') {
      throw { code: 400, message: '验证码错误（开发期固定 8888）' }
    }
    return {
      token: 'mock_token_' + Date.now(),
      userInfo: {
        id: 'A10086',
        name: '陈经理',
        phone,
        role: 'sales_manager',
        agency: '滨江房产 · 华东一区',
        commissionRate: 0.023
      }
    }
  }
  return http.post('/auth/login', { phone, code }, { auth: false })
}

export async function sendSms (phone) {
  if (USE_MOCK) {
    await delay(300)
    if (!/^1\d{10}$/.test(phone)) {
      throw { code: 400, message: '请输入正确的手机号' }
    }
    return { sent: true }
  }
  return http.post('/auth/sms', { phone }, { auth: false })
}

export function logout () {
  return http.post('/auth/logout', {}, { silent: true })
}

/* ==================== 工作台 ==================== */

export async function getHomeData () {
  if (USE_MOCK) {
    await delay(450)
    return {
      agent: mock.currentAgent,
      todos: mock.todos,
      entries: mock.entries
    }
  }
  return http.get('/home/dashboard')
}

/* ==================== 客户 ==================== */

export async function getClientProfile (clientId = 'C001') {
  if (USE_MOCK) {
    await delay(400)
    return {
      client: mock.client,
      preferences: mock.preferences,
      timeline: mock.timeline
    }
  }
  return http.get(`/client/${clientId}/profile`)
}

export async function getClientList (keyword = '') {
  if (USE_MOCK) {
    await delay(400)
    const all = [
      { id: 'C001', name: '王先生', type: '二次改善', intent: '高', budget: '500-600万' },
      { id: 'C002', name: '李女士', type: '首次置业', intent: '中', budget: '300-350万' },
      { id: 'C003', name: '赵先生', type: '学区刚需', intent: '高', budget: '400-450万' }
    ]
    return all.filter(c => !keyword || c.name.includes(keyword))
  }
  return http.get('/client/list', { keyword })
}

/* ==================== 联合推荐决策 ==================== */

export async function getRecommendation (clientId, options = {}) {
  if (USE_MOCK) {
    await delay(500)
    return {
      client: mock.client,
      conclusion: mock.aiConclusion,
      plans: mock.plans,
      complianceNote: mock.complianceNote
    }
  }
  return http.post('/ai/recommend', { clientId, ...options }, { loading: true })
}

/**
 * 生成带看方案
 * 注意：AI 只负责「建议」，最终执行仍由经纪人确认
 */
export async function generateVisitPlan (planId, clientId) {
  if (USE_MOCK) {
    await delay(700)
    return {
      visitId: 'V' + Date.now(),
      planId,
      route: [
        { time: '15:00', title: '王先生 · 滨江·江南里 2 号楼', duration: 60 }
      ]
    }
  }
  return http.post('/ai/visit-plan', { planId, clientId }, { loading: true })
}

/* ==================== AI 文案工厂 ==================== */

export async function generateCopy (payload) {
  if (USE_MOCK) {
    await delay(1400) // 模拟大模型生成耗时
    return {
      content: mock.copyText,
      versionId: 'C' + Date.now(),
      needConfirm: true // 强制人工确认
    }
  }
  return http.post('/ai/copy/generate', payload, { loading: false })
}

export async function publishCopy (versionId, payload) {
  if (USE_MOCK) {
    await delay(600)
    return { publishId: 'P' + Date.now(), status: 'published' }
  }
  return http.post('/ai/copy/publish', { versionId, ...payload })
}

export async function saveCopyDraft (versionId, payload) {
  if (USE_MOCK) {
    await delay(300)
    return { saved: true }
  }
  return http.post('/ai/copy/draft', { versionId, ...payload })
}

/* ==================== 带看跟客 ==================== */

export async function getTodaySchedule () {
  if (USE_MOCK) {
    await delay(400)
    return { stops: mock.stops, note: mock.visitNote }
  }
  return http.get('/visit/today')
}

export async function saveVisitNote (clientId, text) {
  if (USE_MOCK) {
    await delay(500)
    // 模拟 AI 整理：真实场景为语音转写 + 大模型摘要
    return {
      raw: text,
      summary: mock.visitNote.text,
      tags: mock.visitNote.tags
    }
  }
  return http.post('/visit/note', { clientId, text }, { loading: true })
}

export async function startVisit (visitId) {
  if (USE_MOCK) {
    await delay(300)
    return { started: true, startedAt: Date.now() }
  }
  return http.post('/visit/start', { visitId })
}
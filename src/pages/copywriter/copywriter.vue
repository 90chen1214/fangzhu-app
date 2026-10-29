<template>
  <view class="page">
    <fz-statusbar />
    <fz-navbar title="AI 文案工厂" />

    <scroll-view class="scroll" scroll-y :scroll-top="scrollTop">
      <view class="body">
        <!-- 流程步骤 -->
        <view class="steps">
          <view class="step step-done">
            <text class="step-txt step-txt-done">1 选房源</text>
          </view>
          <view class="step-line"></view>
          <view class="step step-done">
            <text class="step-txt step-txt-done">2 选平台风格</text>
          </view>
          <view class="step-line"></view>
          <view class="step step-active">
            <text class="step-txt step-txt-active">3 预览确认</text>
          </view>
        </view>

        <!-- 房源信息 -->
        <view class="fz-card prop">
          <view class="prop-head">
            <text class="prop-label">当前房源</text>
            <text class="prop-change">更换 ›</text>
          </view>
          <text class="prop-title">{{ prop.title }}</text>
          <text class="prop-meta">{{ prop.meta }}</text>
        </view>

        <!-- 平台与风格 -->
        <text class="sec-title">投放平台与文案风格</text>
        <view class="fz-card setting">
          <view class="wrap">
            <view
              v-for="p in platforms"
              :key="p.key"
              class="chip"
              :class="p.active ? 'chip-on' : 'chip-off'"
              @click="pickPlatform(p.key)"
            >
              <text class="chip-txt" :class="p.active ? 'chip-txt-on' : 'chip-txt-off'">{{ p.name }}</text>
            </view>
          </view>

          <text class="mini-label">文案风格</text>
          <view class="wrap">
            <view
              v-for="s in copyStyles"
              :key="s.key"
              class="chip chip-sm"
              :class="s.active ? 'chip-on' : 'chip-off'"
              @click="pickStyle(s.key)"
            >
              <text class="chip-txt" :class="s.active ? 'chip-txt-on' : 'chip-txt-off'">{{ s.name }}</text>
            </view>
          </view>

          <view class="points-box">
            <text class="mini-label">核心卖点（AI 将自动融入文案）</text>
            <view class="wrap">
              <view v-for="pt in sellingPoints" :key="pt" class="point">
                <text class="point-txt">{{ pt }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 预览 -->
        <view class="prev-head">
          <text class="sec-title">文案预览</text>
          <view class="regen" @click="regen">
            <fz-icon name="refresh" :size="28" color="#014B94" />
            <text class="regen-txt">重新生成</text>
          </view>
        </view>

        <view class="fz-card prev">
          <view class="prev-ver">
            <text class="prev-ver-txt">{{ activePlatformName }} · 约 45 秒</text>
          </view>
          <text class="prev-text" v-if="!loading">{{ copyText }}</text>
          <view v-else class="loading">
            <view class="spinner"></view>
            <text class="loading-txt">AI 正在生成文案…</text>
          </view>

          <!-- AI 数字校验：文案中的数字必须与官方房源数据一致 -->
          <view v-if="!loading && checks.length" class="verify" :class="hasMismatch ? 'verify-bad' : 'verify-ok'">
            <view class="verify-head">
              <fz-icon :name="hasMismatch ? 'warn' : 'check'" :size="26" :color="hasMismatch ? '#DC2626' : '#0B8A5E'" />
              <text class="verify-title" :class="hasMismatch ? 'verify-title-bad' : 'verify-title-ok'">
                {{ hasMismatch ? '发现 ' + mismatchCount + ' 处数据不一致，请修正后再发布' : '数据校验通过' }}
              </text>
            </view>
            <view v-for="c in checks" :key="c.label" class="verify-row">
              <text class="verify-label">{{ c.label }}</text>
              <text class="verify-val" :class="c.ok ? 'ok' : 'bad'">{{ c.found }}</text>
              <text v-if="!c.ok" class="verify-expect">应为 {{ c.expect }}</text>
            </view>
          </view>

          <view class="check">
            <fz-icon name="warn" :size="26" color="#D97706" />
            <text class="check-txt">{{ copyCheckTip }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏：强制人工确认 -->
    <view class="actionbar">
      <view class="audit">
        <fz-icon name="shield" :size="28" color="#10B981" />
        <text class="audit-txt">{{ auditTip }}</text>
      </view>
      <view class="act-row">
        <view class="fz-btn-ghost act-btn" @click="saveDraft">
          <text class="act-txt act-txt-ghost">存草稿</text>
        </view>
        <view class="fz-btn-primary act-btn" :class="{ 'act-done': published }" @click="publish">
          <fz-icon :name="published ? 'check' : 'pen'" :size="34" color="#FFFFFF" />
          <text class="act-txt act-txt-primary">{{ published ? '已发布' : '确认并发布' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  currentProperty, platforms, copyStyles, sellingPoints,
  copyText, copyCheckTip, auditTip
} from '../../utils/mock.js'
import { generateCopy, publishCopy, saveCopyDraft } from '../../utils/api.js'
import { requireLogin } from '../../utils/store.js'
import { onLoad } from '@dcloudio/uni-app'

export default {
  data() {
    return {
      prop: currentProperty,
      platforms: platforms.map(p => ({ ...p })),
      copyStyles: copyStyles.map(s => ({ ...s })),
      sellingPoints,
      copyText,
      copyCheckTip,
      auditTip,
      loading: false,
      versionId: '',
      published: false,
      // 官方房源数据（数字校验的比对基准），接后端后由接口返回
      propertyFact: { totalPrice: 558, area: 120, rooms: 3 }
    }
  },
  computed: {
    activePlatformName() {
      const p = this.platforms.find(x => x.active)
      return p ? p.name : ''
    },
    /**
     * AI 数字校验结果
     * 大模型可能编造数字（把 120 平写成 130、558 万写成 5580）
     * 这里从文案中提取关键数字，与官方房源数据比对
     */
    checks() {
      const text = this.copyText || ''
      if (!text) return []
      const fact = this.propertyFact || {}
      const list = []

      // 校验总价：文案中「558 万」「558万」这类表述
      if (fact.totalPrice) {
        const re = new RegExp('(\\d+(?:\\.\\d+)?)\\s*万')
        const found = text.match(re)
        list.push({
          label: '总价',
          ok: found ? Number(found[1]) === Number(fact.totalPrice) : true,
          found: found ? found[0] : '未提及',
          expect: fact.totalPrice + ' 万'
        })
      }

      // 校验面积
      if (fact.area) {
        const re = new RegExp('(\\d+(?:\\.\\d+)?)\\s*平')
        const found = text.match(re)
        list.push({
          label: '面积',
          ok: found ? Number(found[1]) === Number(fact.area) : true,
          found: found ? found[0] : '未提及',
          expect: fact.area + ' 平'
        })
      }

      // 校验房间数（兼容「三房」「3房」「两房」等写法）
      if (fact.rooms) {
        const CN2NUM = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5 }
        const NUM2CN = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五' }
        const found = text.match(/([一二三四五两1-9])\s*房/)
        let ok = true
        if (found) {
          const f = found[1]
          const n = CN2NUM[f] !== undefined ? CN2NUM[f] : Number(f)
          ok = n === Number(fact.rooms)
        }
        list.push({
          label: '户型',
          ok,
          found: found ? found[0] : '未提及',
          expect: (NUM2CN[fact.rooms] || fact.rooms) + '房'
        })
      }

      return list
    },
    hasMismatch() {
      return this.checks.some(c => !c.ok)
    },
    mismatchCount() {
      return this.checks.filter(c => !c.ok).length
    }
  },
  onLoad() {
    if (!requireLogin()) return
    this.versionId = ''
    this.published = false
    this.copyText = ''
    this.generate()
  },
  methods: {
    async generate() {
      this.loading = true
      try {
        const res = await generateCopy({
          propertyId: 'P_1203',
          platform: this.platforms.find(p => p.active).key,
          style: this.copyStyles.find(s => s.active).key,
          points: this.sellingPoints
        })
        this.copyText = res.content
        this.versionId = res.versionId
        this.published = false
      } catch (e) {
        this.copyText = copyText // 接口失败时兜底展示，不给用户白屏
      } finally {
        this.loading = false
      }
    },
    pickPlatform(key) {
      this.platforms.forEach(p => (p.active = p.key === key))
      this.generate()
    },
    pickStyle(key) {
      this.copyStyles.forEach(s => (s.active = s.key === key))
      this.generate()
    },
    async regen() {
      await this.generate()
      if (!this.loading) {
        uni.showToast({ title: '已重新生成', icon: 'success' })
      }
    },
    async saveDraft() {
      if (!this.versionId) return uni.showToast({ title: '请先生成文案', icon: 'none' })
      try {
        await saveCopyDraft(this.versionId, { content: this.copyText })
        uni.showToast({ title: '已存草稿', icon: 'success' })
      } catch (e) { /* 已统一提示 */ }
    },
    publish() {
      // PRD 红线：AI 内容必须人工确认后发布，代码中不存在一键直发路径
      if (!this.versionId) return uni.showToast({ title: '请先生成文案', icon: 'none' })

      // 数字校验未通过时，先拦截，避免把错误信息发给客户
      if (this.hasMismatch) {
        return uni.showModal({
          title: '数据校验未通过',
          content: `文案中有${this.mismatchCount} 处数字与官方房源数据不一致，请先修改后再发布。`,
          confirmText: '去修改',
          cancelText: '知道了',
          success: (res) => {
            if (res.confirm) {
              uni.showToast({ title: '请修正标红处', icon: 'none' })
            }
          }
        })
      }

      uni.showModal({
        title: '发布前请确认',
        editable: true,
        placeholderText: '可在此修正文案后再发布',
        confirmText: '确认发布',
        cancelText: '再检查一下',
        success: async (res) => {
          if (!res.confirm) return
          const finalContent = (res.content || '').trim() || this.copyText
          if (finalContent !== this.copyText) {
            this.copyText = finalContent
          }
          try {
            await publishCopy(this.versionId, { content: finalContent })
            this.published = true
            uni.showToast({ title: '已发布', icon: 'success' })
          } catch (e) { /* 已统一提示 */ }
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F9F9F9;
}
.scroll {
  flex: 1;
  overflow: hidden;
}
.body {
  padding: 28rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 流程步骤 */
.steps {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}
.step {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.step-done {
  background-color: #014DB2;
}
.step-active {
  background-color: #E8F0FD;
}
.step-txt {
  font-size: 24rpx;
  font-weight: 500;
}
.step-txt-done {
  color: #FFFFFF;
}
.step-txt-active {
  color: #014DB2;
}
.step-line {
  width: 28rpx;
  height: 1rpx;
  background-color: #D6D9DE;
}

/* 房源卡 */
.prop {
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.prop-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.prop-label {
  font-size: 26rpx;
  color: #6B7280;
}
.prop-change {
  font-size: 24rpx;
  color: #014DB2;
  font-weight: 500;
}
.prop-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0A1628;
  line-height: 44rpx;
}
.prop-meta {
  font-size: 24rpx;
  color: #6B7280;
}

.sec-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #0A1628;
}

/* 设置卡 */
.setting {
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}
.chip {
  height: 68rpx;
  padding: 0 28rpx;
  border-radius: 34rpx;
  display: flex;
  align-items: center;
}
.chip-sm {
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 32rpx;
}
.chip-on {
  background-color: #014DB2;
}
.chip-off {
  background-color: #F1F5FB;
}
.chip-txt {
  font-size: 24rpx;
}
.chip-txt-on {
  color: #FFFFFF;
  font-weight: 500;
}
.chip-txt-off {
  color: #6B7280;
}
.mini-label {
  font-size: 26rpx;
  color: #6B7280;
}
.points-box {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.point {
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 26rpx;
  background-color: #F5F8FD;
  display: flex;
  align-items: center;
}
.point-txt {
  font-size: 22rpx;
  color: #014B94;
}

/* 预览 */
.prev-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.regen {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  background-color: #F1F5FB;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10rpx;
}
.regen-txt {
  font-size: 24rpx;
  color: #014B94;
  font-weight: 500;
}
.prev {
  padding: 28rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.prev-ver {
  align-self: flex-start;
  height: 44rpx;
  padding: 0 16rpx;
  border-radius: 8rpx;
  background-color: #E8F0FD;
  display: flex;
  align-items: center;
}
.prev-ver-txt {
  font-size: 22rpx;
  color: #014DB2;
  font-weight: 500;
}
.prev-text {
  font-size: 26rpx;
  color: #0A1628;
  line-height: 42rpx;
}
.loading {
  padding: 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}
.spinner {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  border: 4rpx solid #E8F0FD;
  border-top-color: #014DB2;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-txt {
  font-size: 24rpx;
  color: #6B7280;
}
.check {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  padding: 20rpx 22rpx;
  border-radius: 12rpx;
  background-color: #FFFBEB;
  align-items: flex-start;
}
.check-txt {
  flex: 1;
  font-size: 22rpx;
  color: #92400E;
  line-height: 34rpx;
}

/* AI 数字校验 */
.verify {
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.verify-ok {
  background-color: #ECFDF5;
}
.verify-bad {
  background-color: #FEF2F2;
}
.verify-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10rpx;
}
.verify-title {
  font-size: 24rpx;
  font-weight: 600;
}
.verify-title-ok {
  color: #0B8A5E;
}
.verify-title-bad {
  color: #DC2626;
}
.verify-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}
.verify-label {
  font-size: 22rpx;
  color: #6B7280;
  width: 80rpx;
}
.verify-val {
  font-size: 22rpx;
  font-weight: 500;
}
.verify-val.ok {
  color: #0B8A5E;
}
.verify-val.bad {
  color: #DC2626;
  text-decoration: line-through;
}
.verify-expect {
  font-size: 22rpx;
  color: #DC2626;
}

/* 底部操作栏 */
.actionbar {
  background-color: #FFFFFF;
  border-top: 1rpx solid #EAEAEA;
  padding: 24rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  flex-shrink: 0;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}
.audit {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}
.audit-txt {
  font-size: 22rpx;
  color: #0B8A5E;
}
.act-row {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
}
.act-btn {
  flex: 1;
  flex-direction: row;
  gap: 12rpx;
}
.act-txt {
  font-size: 30rpx;
}
.act-txt-ghost {
  color: #014B94;
  font-weight: 500;
}
.act-txt-primary {
  color: #FFFFFF;
  font-weight: 600;
}
.act-done {
  background-color: #10B981;
}
</style>
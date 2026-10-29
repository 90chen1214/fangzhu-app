<template>
  <view class="page">
    <fz-statusbar />
    <fz-navbar title="联合推荐决策" />

    <scroll-view class="scroll" scroll-y>
      <view class="body">
        <!-- 客户卡 -->
        <view class="fz-card client">
          <view class="avatar">
            <text class="avatar-txt">{{ client.avatar }}</text>
          </view>
          <view class="client-info">
            <text class="client-name">{{ client.name }} · {{ client.type }}</text>
            <view class="tags">
              <view class="tag"><text class="tag-txt">{{ client.budget }}</text></view>
              <view class="tag" v-for="t in client.tags" :key="t">
                <text class="tag-txt">{{ t }}</text>
              </view>
            </view>
          </view>
          <view class="switch-btn">
            <text class="switch-txt">切换</text>
          </view>
        </view>

        <!-- AI 结论卡 -->
        <view class="fz-hero concl">
          <view class="concl-head">
            <fz-icon name="spark" :size="40" color="#34D399" />
            <text class="concl-label">AI 决策建议</text>
            <text class="concl-basis">{{ concl.basedOn }}</text>
          </view>
          <text class="concl-text">{{ concl.text }}</text>
          <view class="reasons">
            <view v-for="r in concl.reasons" :key="r" class="reason">
              <text class="reason-txt">{{ r }}</text>
            </view>
          </view>
        </view>

        <!-- 方案对比 -->
        <text class="sec-title">推荐方案对比</text>

        <view
          v-for="p in plans"
          :key="p.id"
          class="fz-card plan"
          :class="{ 'plan-first': p.isFirst }"
        >
          <view class="plan-img">
            <view class="plan-badge"><text class="plan-badge-txt">{{ p.badge }}</text></view>
            <view class="plan-score" :style="{ backgroundColor: p.scoreColor }">
              <text class="plan-score-txt">{{ p.score }}</text>
            </view>
          </view>

          <view class="plan-body">
            <view class="plan-type" :style="{ backgroundColor: p.typeSoft }">
              <text class="plan-type-txt" :style="{ color: p.typeColor }">{{ p.type }}</text>
            </view>
            <text class="plan-title">{{ p.title }}</text>
            <view class="plan-price-row">
              <text class="plan-price">{{ p.price }}</text>
              <text class="plan-price-unit">{{ p.priceUnit }}</text>
              <text class="plan-per">{{ p.perUnit }}</text>
            </view>
            <view class="plan-metas">
              <text
                v-for="m in p.metas"
                :key="m.text"
                class="plan-meta"
                :style="{ color: m.color }"
              >{{ m.text }}</text>
            </view>
            <view class="plan-reason">
              <fz-icon name="warn" :size="26" color="#014DB2" />
              <text class="plan-reason-txt">{{ p.reason }}</text>
            </view>
          </view>

          <view class="pl-actions">
            <view class="fz-btn-primary plan-btn" @click="onVisitPlan(p)">
              <text class="plan-btn-txt plan-btn-primary-txt">生成带看方案</text>
            </view>
            <view class="fz-btn-ghost plan-btn" @click="onDetail(p)">
              <text class="plan-btn-txt plan-btn-ghost-txt">{{ p.detailBtn }}</text>
            </view>
          </view>
        </view>

        <text class="compliance">{{ complianceNote }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { client, aiConclusion, plans, complianceNote } from '../../utils/mock.js'
import { getRecommendation, generateVisitPlan } from '../../utils/api.js'
import { requireLogin } from '../../utils/store.js'
import { onLoad } from '@dcloudio/uni-app'

export default {
  data() {
    return {
      client,
      concl: aiConclusion,
      plans: plans.map((p, i) => ({ ...p, isFirst: i === 0 })),
      complianceNote,
      loading: false
    }
  },
  onLoad() {
    if (!requireLogin()) return
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getRecommendation(this.client.id || 'C001')
        this.client = res.client
        this.concl = res.conclusion
        this.plans = res.plans.map((p, i) => ({ ...p, isFirst: i === 0 }))
        this.complianceNote = res.complianceNote
      } catch (e) {
        // 兜底保留初始 mock 数据
      } finally {
        this.loading = false
      }
    },
    async onVisitPlan(plan) {
      // AI 只给建议，最终生成带看行程由经纪人点击触发
      const res = await uni.showModal({
        title: '生成带看方案',
        content: `将基于「${plan.title}」为${this.client.name}生成带看行程，确认生成？`,
        confirmText: '生成',
        cancelText: '取消'
      })
      if (!res.confirm) return
      try {
        await generateVisitPlan(plan.id, this.client.id || 'C001')
        uni.showToast({ title: '带看方案已生成', icon: 'success' })
        uni.navigateTo({ url: '/pages/viewing/viewing' })
      } catch (e) { /* 已统一提示 */ }
    },
    onDetail (plan) {
      uni.showToast({ title: plan.title + '（详情页待接入）', icon: 'none' })
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

/* 客户卡 */
.client {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx;
}
.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #014DB2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-txt {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.client-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  overflow: hidden;
}
.client-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #0A1628;
}
.tags {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  flex-wrap: wrap;
}
.tag {
  height: 44rpx;
  padding: 0 16rpx;
  border-radius: 8rpx;
  background-color: #F1F5FB;
  display: flex;
  align-items: center;
}
.tag-txt {
  font-size: 22rpx;
  color: #014B94;
}
.switch-btn {
  height: 60rpx;
  padding: 0 24rpx;
  border-radius: 30rpx;
  background-color: #F1F5FB;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.switch-txt {
  font-size: 24rpx;
  color: #014B94;
  font-weight: 500;
}

/* AI 结论 */
.concl {
  padding: 32rpx 36rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.concl-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14rpx;
}
.concl-label {
  font-size: 26rpx;
  color: #34D399;
  font-weight: 500;
  flex-shrink: 0;
}
.concl-basis {
  flex: 1;
  font-size: 22rpx;
  color: #8FAEDC;
  text-align: right;
}
.concl-text {
  font-size: 28rpx;
  color: #E6EEFB;
  line-height: 44rpx;
}
.reasons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}
.reason {
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 8rpx;
  background-color: #123E7A;
  display: flex;
  align-items: center;
}
.reason-txt {
  font-size: 22rpx;
  color: #FFFFFF;
}

.sec-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #0A1628;
}

/* 方案卡 */
.plan {
  overflow: hidden;
}
.plan-first {
  border: 2rpx solid #014DB2;
}
.plan-img {
  width: 100%;
  height: 248rpx;
  background: linear-gradient(135deg, #DBE6F2 0%, #B9CFE6 100%);
  position: relative;
}
.plan-badge {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  height: 48rpx;
  padding: 0 20rpx;
  border-radius: 0 12rpx 12rpx 0;
  background-color: #014DB2;
  display: flex;
  align-items: center;
}
.plan-badge-txt {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 500;
}
.plan-score {
  position: absolute;
  left: 24rpx;
  bottom: -40rpx;
  width: 104rpx;
  height: 104rpx;
  border-radius: 52rpx;
  border: 4rpx solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}
.plan-score-txt {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.plan-body {
  padding: 28rpx 32rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.plan-type {
  align-self: flex-start;
  height: 44rpx;
  padding: 0 16rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
}
.plan-type-txt {
  font-size: 22rpx;
  font-weight: 500;
}
.plan-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0A1628;
  line-height: 44rpx;
}
.plan-price-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 12rpx;
}
.plan-price {
  font-size: 44rpx;
  font-weight: 700;
  color: #EF4444;
  line-height: 56rpx;
}
.plan-price-unit {
  font-size: 24rpx;
  color: #6B7280;
}
.plan-per {
  flex: 1;
  font-size: 24rpx;
  color: #6B7280;
  text-align: right;
}
.plan-metas {
  display: flex;
  flex-direction: row;
  gap: 28rpx;
}
.plan-meta {
  font-size: 24rpx;
}
.plan-reason {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  padding: 20rpx 22rpx;
  border-radius: 12rpx;
  background-color: #F5F8FD;
  align-items: flex-start;
}
.plan-reason-txt {
  flex: 1;
  font-size: 24rpx;
  color: #0A1628;
  line-height: 36rpx;
}
.plan-actions {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  padding: 0 32rpx 28rpx;
}
.plan-btn {
  flex: 1;
}
.plan-btn-txt {
  font-size: 28rpx;
}
.plan-btn-primary-txt {
  color: #FFFFFF;
  font-weight: 600;
}
.plan-btn-ghost-txt {
  color: #014B94;
  font-weight: 500;
}

.compliance {
  font-size: 22rpx;
  color: #9AA3AF;
  line-height: 34rpx;
}
</style>
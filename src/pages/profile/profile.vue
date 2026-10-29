<template>
  <view class="page">
    <fz-statusbar />
    <fz-navbar title="客户画像" />

    <scroll-view class="scroll" scroll-y>
      <view class="body">
        <!-- 客户主卡 -->
        <view class="fz-hero prof">
          <view class="prof-top">
            <view class="avatar">
              <text class="avatar-txt">{{ client.avatar }}</text>
            </view>
            <view class="prof-info">
              <text class="prof-name">{{ client.name }} · {{ client.type }}</text>
              <text class="prof-meta">
                跟进 {{ client.followMonths }} 个月 · 带看 {{ client.visitTimes }} 次 · 意向度 {{ client.intentLevel }}
              </text>
            </view>
          </view>

          <view class="metrics">
            <view class="metric">
              <text class="metric-v">{{ client.budget }}</text>
              <text class="metric-l">预算(万)</text>
            </view>
            <view class="metric">
              <text class="metric-v">{{ client.intentCount }}</text>
              <text class="metric-l">意向房源</text>
            </view>
            <view class="metric">
              <text class="metric-v">{{ client.commissionRate }}</text>
              <text class="metric-l">佣金率</text>
            </view>
          </view>

          <view class="prof-note">
            <fz-icon name="shield" :size="28" color="#34D399" />
            <text class="prof-note-txt">{{ client.avatarUpdated }}</text>
          </view>
        </view>

        <!-- 偏好权重 -->
        <text class="sec-title">购房偏好权重</text>
        <view class="fz-card pref">
          <view v-for="p in preferences" :key="p.name" class="pref-item">
            <view class="pref-head">
              <text class="pref-name">{{ p.name }}</text>
              <text class="pref-value" :style="{ color: p.color }">{{ p.value }}</text>
            </view>
            <view class="pref-track">
              <view class="pref-fill" :style="{ width: p.width, backgroundColor: p.color }"></view>
            </view>
          </view>
        </view>

        <!-- 时间线 -->
        <text class="sec-title">跟进时间线</text>
        <view class="fz-card tl">
          <view v-for="(t, i) in timeline" :key="t.day" class="tl-wrap">
            <view v-if="i > 0" class="fz-divider"></view>
            <view class="tl-item">
              <view class="tl-date">
                <text class="tl-day">{{ t.day }}</text>
                <text class="tl-month">{{ t.month }}</text>
              </view>
              <view class="tl-info">
                <text class="tl-title">{{ t.title }}</text>
                <text class="tl-sub">{{ t.sub }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { client, preferences, timeline } from '../../utils/mock.js'
import { getClientProfile } from '../../utils/api.js'
import { requireLogin } from '../../utils/store.js'

export default {
  data() {
    return {
      client,
      preferences,
      timeline
    }
  },
  onLoad() {
    if (!requireLogin()) return
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const res = await getClientProfile('C001')
        this.client = res.client
        this.preferences = res.preferences
        this.timeline = res.timeline
      } catch (e) {
        // 兜底保留初始数据
      }
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

/* 主卡 */
.prof {
  padding: 36rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}
.prof-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 26rpx;
}
.avatar {
  width: 104rpx;
  height: 104rpx;
  border-radius: 52rpx;
  background-color: #2A55A0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-txt {
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.prof-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  overflow: hidden;
}
.prof-name {
  font-size: 38rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 52rpx;
}
.prof-meta {
  font-size: 24rpx;
  color: #A9C2E8;
  line-height: 34rpx;
}
.metrics {
  display: flex;
  flex-direction: row;
}
.metric {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}
.metric-v {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 44rpx;
}
.metric-l {
  font-size: 22rpx;
  color: #8FAEDC;
}
.prof-note {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}
.prof-note-txt {
  font-size: 22rpx;
  color: #A9C2E8;
}

.sec-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0A1628;
}

/* 偏好 */
.pref {
  padding: 28rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}
.pref-item {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.pref-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.pref-name {
  font-size: 26rpx;
  color: #0A1628;
}
.pref-value {
  font-size: 26rpx;
  font-weight: 700;
}
.pref-track {
  height: 12rpx;
  border-radius: 6rpx;
  background-color: #EDF1F6;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}
.pref-fill {
  height: 12rpx;
  border-radius: 6rpx;
}

/* 时间线 */
.tl {
  padding: 28rpx 32rpx;
  display: flex;
  flex-direction: column;
}
.tl-wrap {
  display: flex;
  flex-direction: column;
}
.tl-item {
  display: flex;
  flex-direction: row;
  gap: 22rpx;
  padding: 24rpx 0;
  align-items: flex-start;
}
.tl-date {
  width: 84rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex-shrink: 0;
}
.tl-day {
  font-size: 30rpx;
  font-weight: 700;
  color: #0A1628;
  line-height: 38rpx;
}
.tl-month {
  font-size: 20rpx;
  color: #9AA3AF;
}
.tl-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  overflow: hidden;
}
.tl-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #0A1628;
  line-height: 40rpx;
}
.tl-sub {
  font-size: 24rpx;
  color: #6B7280;
}
</style>